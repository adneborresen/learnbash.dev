BIOS images from v86 commit 2d6f9aa (the commit npm `v86@0.5.469` was built from):
https://github.com/copy/v86/tree/2d6f9aa/bios

Both files are built from **SeaBIOS rel-1.16.2** by v86's `bios/fetch-and-build-seabios.sh`
(with v86's `bios/seabios.config`):

- `seabios.bin` – SeaBIOS (`out/bios.bin`)
- `vgabios.bin` – SeaVGABIOS (`out/vgabios.bin`)

License: **LGPL-3.0** (https://www.seabios.org/, source: https://git.seabios.org/seabios.git,
tag `rel-1.16.2`). When these files are served to browsers, the site's licenses page must name
them, link that source and the build script/config above.

Update these together with the `v86` npm version: saved VM snapshots are only valid for the
exact v86 build + BIOS + image they were created with.
