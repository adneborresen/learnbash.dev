// Talks to the guest agent on serial port 1. Works in browsers and Node.
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (s) => {
  let bin = "";
  for (const b of enc.encode(String(s))) bin += String.fromCharCode(b);
  return btoa(bin);
};
const unb64 = (s) => dec.decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));

export class AgentClient {
  constructor(vm) {
    this.vm = vm;
    this.buf = "";
    this.nextId = 1;
    this.pending = new Map();
    this.readyResolvers = [];
    vm.add_listener("serial1-output-byte", (b) => {
      this.buf += String.fromCharCode(b);
      let m;
      while ((m = /@@LB1 (\d+) (\d+) ([A-Za-z0-9+/=]*)@@\n/.exec(this.buf))) {
        this.buf = this.buf.slice(m.index + m[0].length);
        const id = Number(m[1]);
        const res = { code: Number(m[2]), out: unb64(m[3]) };
        if (id === 0) this.readyResolvers.splice(0).forEach((r) => r());
        this.pending.get(id)?.(res);
        this.pending.delete(id);
      }
    });
  }
  waitReady() {
    return new Promise((r) => this.readyResolvers.push(r));
  }
  send(cmd, ...args) {
    const id = this.nextId++;
    const line = ["LB1", id, cmd, ...args.map(b64)].join(" ") + "\n";
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`agent timeout: ${cmd}`)), 20000);
      this.pending.set(id, (r) => { clearTimeout(t); resolve(r); });
      this.vm.serial_send_bytes(1, enc.encode(line));
    });
  }
}
