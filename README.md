# learnbash.dev

Learn Bash by solving small challenges in a real Linux system that runs entirely in your
browser (the [v86](https://github.com/copy/v86) x86 emulator + a tiny Alpine Linux with GNU tools).

Status: early development (milestone M1: reproducible VM image pipeline).

## Requirements

- Node.js 24+
- Docker (builds the 32-bit Linux image)

## Commands

```sh
npm ci
npm run build:vm    # build kernel + root filesystem, boot once, save the VM snapshot
npm test            # boot the snapshot and verify the environment (GNU tools, agent, ...)
npm run lint        # shellcheck all guest scripts
npm run typecheck
npm run spike:dev   # the M0 prototype page at http://localhost:5173
```

Build outputs land in `build/`: `build/image/` (kernel, initramfs, `packages.txt`) and
`build/state/` (`state.bin.zst` snapshot + `manifest.json` describing what it was built from).

## How it fits together

- `image/` – Dockerfile and files copied into the guest (init, guest agent, checker helpers).
  The learner's shell runs on serial port 0 (shown in the page with xterm.js); a root-only
  agent on serial port 1 runs challenge setup and check scripts.
- `image/vm-config.json` – RAM size and kernel command line, shared by every consumer of the
  snapshot (a snapshot only restores with identical settings).
- `src/engine/` – code shared by the website and the Node tests.
- `scripts/` – build scripts and the Node VM harness.
- `tests/` – tests that run against the real VM snapshot.
