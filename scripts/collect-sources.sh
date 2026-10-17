#!/bin/sh
# Collects the source code of every package in build/image into
# build/sources/<tag>.tar (see image/sources/collect.sh). Needs Docker and
# network access; downloads a few hundred MB (the Linux kernel is most of it).
set -eu
cd "$(dirname "$0")/.."
[ -f build/image/packages.tsv ] || { echo "run npm run build:image first" >&2; exit 1; }
tag=$(node scripts/lib/image-sources.ts tag)
branch=v$(cut -d. -f1,2 build/image/alpine-release)
alpine=$(sed -n 's/^ARG ALPINE=//p' image/Dockerfile)
rm -rf build/sources && mkdir -p build/sources
if command -v cygpath >/dev/null 2>&1; then here=$(cygpath -wa .); else here=$(pwd); fi
MSYS_NO_PATHCONV=1 docker run --rm \
  -e ALPINE_BRANCH="$branch" -e ARCHIVE_NAME="$tag.tar" \
  -v "$here/build/image:/in:ro" -v "$here/build/sources:/out" -v "$here/image/sources:/scripts:ro" \
  "$alpine" sh /scripts/collect.sh
echo "build/sources/$tag.tar"
