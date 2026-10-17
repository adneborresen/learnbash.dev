#!/bin/sh
# Lints every shell script that ends up in (or builds) the VM image.
# Uses a local shellcheck if installed, otherwise the pinned Docker image.
set -eu
cd "$(dirname "$0")/.."
files=$(find image scripts -type f \( -name '*.sh' -o -path 'image/overlay/*' \) \
          ! -name '*.md' ! -name inittab ! -name hostname | sort)
if command -v shellcheck >/dev/null 2>&1; then
  # shellcheck disable=SC2086 # word splitting of the file list is intended
  shellcheck $files
else
  # shellcheck disable=SC2086
  MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd)":/mnt -w /mnt \
    koalaman/shellcheck:v0.10.0 $files
fi
echo "shellcheck: $(echo "$files" | wc -l) files OK"
