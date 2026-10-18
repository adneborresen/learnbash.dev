# learnbash.dev

Learn Bash by solving small challenges in a real Linux system that runs entirely in your
browser (the [v86](https://github.com/copy/v86) x86 emulator + a tiny Alpine Linux with GNU tools).

Status: getting ready to launch (milestone M6). To add a challenge, see
[docs/authoring.md](docs/authoring.md).

## Requirements

- Node.js 24+
- Docker (builds the 32-bit Linux image)

## Commands

```sh
npm ci
npm run build:vm    # build kernel + root filesystem, boot once, save the VM snapshot
npm test            # boot the snapshot: environment, engine and every challenge
npm run check:content  # validate challenge files
npm run todo-review    # list statements marked for expert review
npm run feedback       # learner feedback from the live site (needs wrangler login)
npm run stats          # how far learners get: anonymous counts per challenge
npm run lint        # shellcheck all guest scripts
npm run typecheck
npm run dev         # site at http://localhost:5173/ (engine playground: /dev/engine.html)
npm run build       # production build into dist/
npm run test:e2e    # build, then play challenges in Chromium, Firefox and WebKit
                    # (first time: npx playwright install chromium firefox webkit)
sh scripts/collect-sources.sh  # source code of every package in the image (GPL); CI publishes it
```

Build outputs land in `build/`: `build/image/` (kernel, initramfs, `packages.txt`) and
`build/state/` (`state.bin.zst` snapshot + `manifest.json` describing what it was built from).

## How it fits together

- `image/` – Dockerfile and files copied into the guest (init, guest agent, checker helpers).
  The learner's shell runs on serial port 0 (shown in the page with xterm.js); a root-only
  agent on serial port 1 runs challenge setup and check scripts.
- `image/vm-config.json` – RAM size and kernel command line, shared by every consumer of the
  snapshot (a snapshot only restores with identical settings).
- `src/engine/` – the engine: `vm-session.ts` (restore/setup/check/reset, shared by the website and
  the Node tests), `browser-vm.ts` (lazy-loads v86 + the snapshot), `terminal-view.ts` (xterm.js +
  mobile key bar), `agent-client.ts` (guest agent protocol).
- `index.html` (landing), `challenge.html`, `licenses/index.html`, `404.html`, `src/pages/` –
  the pages. The build writes one `challenges/<id>/index.html` per challenge from
  `challenge.html`. The licenses page is generated from the image's package list.
- `public/_headers` – caching and security headers (Cloudflare Pages format).
- `functions/` – server code (Cloudflare Pages Functions): `/api/feedback` saves learner
  feedback and `/api/usage` anonymous counts of what happens on challenge pages
  (`src/feedback/`), in a Cloudflare D1 database bound as `FEEDBACK_DB`.
- `src/site/` – shared styles, URLs and progress (saved in the browser's localStorage).
- `dev/` – developer pages (engine playground).
- `docs/spike-results.md` – measurements from the M0 prototype.
- `scripts/` – build scripts and the Node VM harness.
- `challenges/` – the course content, one folder per challenge (see docs/authoring.md).
- `tests/` – tests that run against the real VM snapshot, including every challenge's
  solution and wrong attempts. `e2e/` – browser tests of the built site (Playwright).
