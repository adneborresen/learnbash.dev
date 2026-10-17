// Client for the guest agent listening on the VM's second serial port.
// Protocol (see image/overlay/usr/local/lib/learnbash/agent):
//   request:  LB1 <id> <CMD> [b64arg...]\n
//   response: @@LB1 <id> <exit-code> <b64-output>@@\n   (id 0 = "agent ready")
// Used both in the browser and in Node tests.

export interface SerialVm {
  add_listener(event: "serial1-output-byte", listener: (byte: number) => void): void;
  serial_send_bytes(port: number, data: Uint8Array): void;
}

export interface AgentResult {
  code: number;
  out: string;
}

export type AgentCommand = "PING" | "SETTIME" | "WINSIZE" | "RUN" | "START" | "RESTART_SHELL";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const RESPONSE = /@@LB1 (\d+) (\d+) ([A-Za-z0-9+/=]*)@@\n/;
const TRAILING_NEWLINES = /\n+$/;

function toBase64(text: string): string {
  let bin = "";
  for (const b of encoder.encode(text)) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): string {
  return decoder.decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

export class AgentClient {
  private buf = "";
  private nextId = 1;
  private pending = new Map<number, (r: AgentResult | Error) => void>();
  private readyWaiters: Array<() => void> = [];
  private vm: SerialVm;
  private timeoutMs: number;

  constructor(vm: SerialVm, timeoutMs = 20000) {
    this.vm = vm;
    this.timeoutMs = timeoutMs;
    vm.add_listener("serial1-output-byte", (byte) => this.onByte(byte));
  }

  /** Resolves when the agent announces itself (only happens on a cold boot). */
  waitReady(): Promise<void> {
    return new Promise((resolve) => this.readyWaiters.push(resolve));
  }

  send(cmd: AgentCommand, ...args: Array<string | number>): Promise<AgentResult> {
    const id = this.nextId++;
    const line = ["LB1", id, cmd, ...args.map((a) => toBase64(String(a)))].join(" ") + "\n";
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`guest agent did not answer ${cmd} within ${this.timeoutMs} ms`));
      }, this.timeoutMs);
      this.pending.set(id, (r) => {
        clearTimeout(timer);
        if (r instanceof Error) reject(r);
        else resolve(r);
      });
      this.vm.serial_send_bytes(1, encoder.encode(line));
    });
  }

  /**
   * Fails every request still waiting for an answer. Called before the VM is
   * restored from a snapshot: the restored guest never saw those requests.
   */
  cancelAll(reason: string): void {
    const waiting = [...this.pending.values()];
    this.pending.clear();
    this.buf = "";
    for (const settle of waiting) settle(new Error(reason));
  }

  /** Runs a bash script as root inside the VM; `answer` is exposed as $ANSWER. */
  run(script: string, answer = ""): Promise<AgentResult> {
    return this.send("RUN", script, answer);
  }

  private onByte(byte: number): void {
    this.buf += String.fromCharCode(byte);
    if (byte !== 0x0a) return;
    let m: RegExpExecArray | null;
    while ((m = RESPONSE.exec(this.buf))) {
      this.buf = this.buf.slice(m.index + m[0].length);
      const id = Number(m[1]);
      // Trailing newlines are dropped, like a shell's $(...) would.
      const result = { code: Number(m[2]), out: fromBase64(m[3]).replace(TRAILING_NEWLINES, "") };
      if (id === 0) this.readyWaiters.splice(0).forEach((w) => w());
      this.pending.get(id)?.(result);
      this.pending.delete(id);
    }
    // Anything before a newline that isn't a response is noise; don't let it grow.
    if (!this.buf.includes("@@LB1")) this.buf = "";
  }
}
