BIOS images from v86 commit 2d6f9aa (the commit npm `v86@0.5.469` was built from):
https://github.com/copy/v86/tree/2d6f9aa/bios

- `seabios.bin` – SeaBIOS (LGPL-3.0, https://www.seabios.org/)
- `vgabios.bin` – VGA BIOS as distributed by v86

<!-- TODO-REVIEW: confirm the exact upstream project, version and license of both files
     (see the v86 repository's bios/ folder and its docs) before launch, and list them on
     the site's /licenses page with links to their source code. -->

Update these together with the `v86` npm version: saved VM snapshots are only valid for the
exact v86 build + BIOS + image they were created with.
