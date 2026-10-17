// One learner's VM: restores the snapshot, prepares a challenge, checks it.
// Environment-independent: the browser and the Node tests create the v86
// instance differently, then both drive it through this class.
import { AgentClient, type SerialVm } from "./agent-client.ts";

/** The parts of the v86 API the session uses. */
export interface V86Like extends SerialVm {
  add_listener(event: "serial0-output-byte", listener: (byte: number) => void): void;
  add_listener(event: "serial1-output-byte", listener: (byte: number) => void): void;
  serial0_send(data: string): void;
  restore_state(state: ArrayBuffer): Promise<void>;
  run(): Promise<void>;
  is_running(): boolean;
  /** Internal v86 helper (not in its typings); covered by tests/engine.test.ts. */
  zstd_decompress(decompressedSize: number, src: Uint8Array): ArrayBuffer;
  destroy(): Promise<void>;
}

/** The zstd-compressed snapshot plus its size once decompressed. */
export interface Snapshot {
  zst: Uint8Array;
  rawSize: number;
}

export interface StartOptions {
  /** Challenge setup script, run as root before the learner gets the prompt. */
  setup?: string;
  rows?: number;
  cols?: number;
}

export interface CheckResult {
  passed: boolean;
  /** First line of the checker's output: feedback for the learner. */
  message: string;
  /** Everything the checker printed (for debugging and tests). */
  output: string;
}

export class SetupError extends Error {}

const CTRL_L = String.fromCharCode(12); // bash: clear the screen, redraw the prompt

export class VmSession {
  readonly agent: AgentClient;
  /** How long the phases of the last start() took (for diagnostics). */
  lastStartTimings?: { decompressMs: number; restoreMs: number; setupMs: number };
  private vm: V86Like;
  private snapshot: Snapshot;
  private queue: Promise<unknown> = Promise.resolve();
  private resetListeners: Array<() => void> = [];

  constructor(vm: V86Like, snapshot: Snapshot) {
    this.vm = vm;
    this.snapshot = snapshot;
    this.agent = new AgentClient(vm);
  }

  /** Bytes the learner's shell writes to the terminal. */
  onOutput(listener: (byte: number) => void): void {
    this.vm.add_listener("serial0-output-byte", listener);
  }

  /** Called right after the VM was put back to the snapshot (clear the screen). */
  onReset(listener: () => void): void {
    this.resetListeners.push(listener);
  }

  /** Keystrokes from the learner. */
  sendInput(data: string): void {
    this.vm.serial0_send(data);
  }

  /**
   * Puts the VM back into the pristine snapshot state and runs the challenge
   * setup. Used for the first start, for Reset and after a page reload.
   */
  start(options: StartOptions = {}): Promise<void> {
    return this.enqueue(async () => {
      this.agent.cancelAll("the VM was reset");
      // Decompress on every start instead of keeping a ~60 MB pristine copy:
      // costs a few hundred ms but keeps memory low on phones.
      const t0 = performance.now();
      const state = this.vm.zstd_decompress(this.snapshot.rawSize, this.snapshot.zst);
      const t1 = performance.now();
      await this.vm.restore_state(state);
      if (!this.vm.is_running()) await this.vm.run();
      const t2 = performance.now();
      for (const listener of this.resetListeners) listener();

      // Clock, terminal size and setup in a single round trip to the agent.
      const result = await this.agent.send(
        "START",
        Math.floor(Date.now() / 1000),
        options.rows ?? 24,
        options.cols ?? 80,
        options.setup ?? "true",
      );
      this.lastStartTimings = {
        decompressMs: Math.round(t1 - t0),
        restoreMs: Math.round(t2 - t1),
        setupMs: Math.round(performance.now() - t2),
      };
      if (result.code !== 0) {
        throw new SetupError(`challenge setup failed (exit ${result.code}): ${result.out}`);
      }
      this.vm.serial0_send(CTRL_L);
    });
  }

  /** Runs a checker script; `answer` is what the learner typed into the answer box. */
  check(script: string, answer = ""): Promise<CheckResult> {
    return this.enqueue(async () => {
      const r = await this.agent.run(script, answer);
      return { passed: r.code === 0, message: r.out.split("\n")[0] ?? "", output: r.out };
    });
  }

  /** Tells the learner's shell the terminal size (so `less` etc. fill the screen). */
  resize(rows: number, cols: number): Promise<void> {
    return this.enqueue(async () => {
      await this.agent.send("WINSIZE", rows, cols);
    });
  }

  destroy(): Promise<void> {
    this.agent.cancelAll("the VM was shut down");
    return this.vm.destroy();
  }

  /** Runs operations one at a time so a Check can't interleave with a Reset. */
  private enqueue<T>(op: () => Promise<T>): Promise<T> {
    const next = this.queue.then(op, op);
    this.queue = next.catch(() => undefined);
    return next;
  }
}
