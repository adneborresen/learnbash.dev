# M0 spike results (2026-10-17)

Setup: v86 0.5.469 (commit 2d6f9aa), Alpine 3.22 x86 (32-bit) `linux-virt` kernel,
whole rootfs as initramfs, 128 MB guest RAM, GNU bash/coreutils/findutils/grep/sed/gawk/less.
Measured on the dev laptop (Windows 11, Node 24, Chromium via Playwright, localhost).

| Metric | Value |
|---|---|
| Kernel (`vmlinuz`) | 7.7 MB |
| Rootfs initramfs (gzip / raw) | 7.9 MB / 17.9 MB |
| Cold boot to agent ready (Node) | ~5.2 s (only done at build time) |
| Snapshot raw / zstd-19 | 57.9 MB / **13.9 MB** |
| Restore snapshot | ~50–150 ms |
| Restore → setup done → prompt (Node) | ~0.8–0.95 s |
| Browser: page load → challenge ready (localhost) | ~1.3 s |
| Browser: Reset | < 1 s |

Things learned:
- Alpine 3.22 still ships x86 (32-bit) and its kernel boots in v86 unmodified.
- `init_on_free=1` on the kernel command line cut the snapshot from 23.5 MB to 15.2 MB
  (freed pages are zero and compress away). Dropping `file` (10 MB magic database),
  `util-linux-misc` and `apk` brought it to 13.9 MB.
- Respawning the learner shell after setup cost ~1.9 s (login + bash-completion).
  Not needed: the snapshot already contains a pristine shell; we send Ctrl-L instead.
- Each agent round trip is ~0.25–0.4 s (forks are slow under emulation). Fine for now;
  can be optimised later (fewer subshells in the agent).
- Terminal size sync (`stty rows/cols` from the agent) works: `less` fills the xterm.
- Node prints a libuv assertion on exit on Windows after `vm.destroy()`; harmless, exit
  code is correct. Revisit in M2.

Still to verify (needs real devices, which I can't drive from here):
- Firefox and Safari desktop; one Android phone; one iPhone (memory: the page keeps a
  ~58 MB pristine state copy in RAM for Reset).
- Cold load over a real network (13.9 MB snapshot + 2 MB wasm).

Next optimisation candidates: custom slim kernel (likely biggest win), 96/64 MB RAM.

Decision: **GO** on Alpine + initramfs + serial-agent design.
