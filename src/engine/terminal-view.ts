// xterm.js terminal wired to a VmSession, plus an on-screen key bar for
// phones (whose keyboards lack Tab, Ctrl, Esc and arrow keys).
import "@xterm/xterm/css/xterm.css";
import { Terminal, type ITheme } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { VmSession } from "./vm-session.ts";

const ESC = String.fromCharCode(27);
const ctrl = (letter: string) => String.fromCharCode(letter.toUpperCase().charCodeAt(0) - 64);

/** Keys shown in the key bar: [label, bytes sent, accessible name]. */
export const KEY_BAR: Array<[string, string, string]> = [
  ["Tab", "\t", "Tab (complete)"],
  ["Ctrl‑C", ctrl("c"), "Control C (stop command)"],
  ["Esc", ESC, "Escape"],
  ["↑", `${ESC}[A`, "Up arrow (previous command)"],
  ["↓", `${ESC}[B`, "Down arrow"],
  ["←", `${ESC}[D`, "Left arrow"],
  ["→", `${ESC}[C`, "Right arrow"],
  ["|", "|", "Pipe"],
  ["~", "~", "Tilde"],
  ["/", "/", "Slash"],
  ["-", "-", "Dash"],
  ["*", "*", "Star"],
  [">", ">", "Greater than"],
  ["Ctrl‑D", ctrl("d"), "Control D (end of input)"],
];

export interface TerminalViewOptions {
  fontSize?: number;
  theme?: ITheme;
}

export class TerminalView {
  readonly term: Terminal;
  private fit = new FitAddon();
  private pending: number[] = [];
  private flushScheduled = false;
  private session?: VmSession;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private observer: ResizeObserver;

  constructor(container: HTMLElement, options: TerminalViewOptions = {}) {
    this.term = new Terminal({
      fontFamily: 'ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      fontSize: options.fontSize ?? 15,
      cursorBlink: true,
      scrollback: 2000,
      theme: options.theme ?? { background: "#0b0d10", foreground: "#e6e6e6", cursor: "#e6e6e6" },
    });
    this.term.loadAddon(this.fit);
    this.term.open(container);
    this.fit.fit();
    this.observer = new ResizeObserver(() => this.refit());
    this.observer.observe(container);
    this.enableTouchScrolling(container);
  }

  /**
   * xterm.js doesn't scroll on touch: a swipe over the terminal does nothing.
   * Swiping scrolls back through earlier output; in full-screen programs
   * (less, nano) it sends arrow keys instead, like a mouse wheel does. At the
   * end of the output the swipe scrolls the page as usual.
   */
  private enableTouchScrolling(container: HTMLElement): void {
    let lastY: number | undefined;
    let leftover = 0;
    container.addEventListener("touchstart", (e) => {
      lastY = e.touches.length === 1 ? e.touches[0].clientY : undefined;
      leftover = 0;
    }, { passive: true, capture: true });
    container.addEventListener("touchmove", (e) => {
      if (lastY === undefined || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const lineHeight = container.clientHeight / this.term.rows;
      leftover += (lastY - y) / lineHeight;
      lastY = y;
      const lines = Math.trunc(leftover);
      if (lines === 0) {
        e.preventDefault();
        return;
      }
      leftover -= lines;
      const buffer = this.term.buffer.active;
      if (buffer.type === "alternate") {
        this.session?.sendInput(`${ESC}[${lines < 0 ? "A" : "B"}`.repeat(Math.abs(lines)));
      } else {
        const atTop = buffer.viewportY === 0;
        const atBottom = buffer.viewportY >= buffer.baseY;
        if ((lines < 0 && atTop) || (lines > 0 && atBottom)) return; // let the page scroll
        this.term.scrollLines(lines);
      }
      e.preventDefault();
    }, { passive: false, capture: true });
  }

  get rows(): number {
    return this.term.rows;
  }

  get cols(): number {
    return this.term.cols;
  }

  attach(session: VmSession): void {
    this.session = session;
    session.onOutput((byte) => this.queue(byte));
    session.onReset(() => {
      this.pending = []; // drop output that belongs to the previous attempt
      this.term.reset();
    });
    this.term.onData((data) => session.sendInput(data));
    this.term.onResize(({ rows, cols }) => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => void session.resize(rows, cols), 150);
    });
  }

  focus(): void {
    this.term.focus();
  }

  /** Builds the on-screen key bar into `container`. */
  renderKeyBar(container: HTMLElement): void {
    container.setAttribute("role", "toolbar");
    container.setAttribute("aria-label", "Extra keys");
    for (const [label, bytes, name] of KEY_BAR) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-label", name);
      // Keep focus (and the phone keyboard) on the terminal.
      button.addEventListener("pointerdown", (e) => e.preventDefault());
      button.addEventListener("click", () => {
        this.session?.sendInput(bytes);
        this.term.focus();
      });
      container.append(button);
    }
  }

  dispose(): void {
    this.observer.disconnect();
    this.term.dispose();
  }

  private refit(): void {
    try {
      this.fit.fit();
    } catch {
      // Container not visible (e.g. display: none); fit again when it is.
    }
  }

  /** Output arrives one byte at a time; hand it to xterm once per frame. */
  private queue(byte: number): void {
    this.pending.push(byte);
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    requestAnimationFrame(() => {
      this.flushScheduled = false;
      const chunk = new Uint8Array(this.pending);
      this.pending = [];
      this.term.write(chunk);
    });
  }
}
