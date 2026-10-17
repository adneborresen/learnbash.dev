BIOS images from v86 commit 2d6f9aa (the commit npm `v86@0.5.469` was built from):
https://github.com/copy/v86/tree/2d6f9aa/bios

- `seabios.bin` — SeaBIOS, LGPL-3.0 (source: https://www.seabios.org/)
- `vgabios.bin` — VGA BIOS, LGPL-2.1 (source: https://github.com/copy/v86/tree/master/bios and the
  upstream projects listed there)

Update these together with the `v86` npm version: saved VM snapshots are only valid for the
exact v86 build + BIOS + image they were created with.
