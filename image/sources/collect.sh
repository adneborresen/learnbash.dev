#!/bin/sh
# Collects the complete corresponding source code of everything in the VM
# image, as required by the GPL when we distribute the image to browsers.
# Runs inside an Alpine container (see scripts/collect-sources.sh):
#   /in/packages.tsv   name, version, origin, license, url, aports commit
#   /out/              receives src/<origin>-<version>/ and the archive
# For every source package it takes the build recipe (APKBUILD + patches)
# from the exact aports commit the binary was built from, then downloads and
# checksum-verifies the upstream sources it lists (Alpine's mirror first).
set -eu
: "${ALPINE_BRANCH:?e.g. v3.22}"
: "${ARCHIVE_NAME:?}"
apk add --no-cache -q abuild curl git tar
export DISTFILES_MIRROR="https://distfiles.alpinelinux.org/distfiles/$ALPINE_BRANCH"
tab=$(printf '\t')
mkdir -p /out/src /work

# fetch_recipe COMMIT ORIGIN: checks out main/ORIGIN or community/ORIGIN from
# that aports commit (downloading only the files needed) and prints its path.
# Tries GitHub's official mirror of the repository first: Alpine's own GitLab
# often times out on these fetches (HTTP 504), costing minutes per package.
fetch_recipe() {
  for remote in https://github.com/alpinelinux/aports.git https://gitlab.alpinelinux.org/alpine/aports.git; do
    rm -rf /work/aports
    git init -q /work/aports
    git -C /work/aports remote add origin "$remote"
    git -C /work/aports fetch -q --depth 1 --filter=blob:none origin "$1" || continue
    for repo in main community; do
      if git -C /work/aports checkout -q FETCH_HEAD -- "$repo/$2" 2>/dev/null; then
        echo "/work/aports/$repo/$2"
        return 0
      fi
    done
  done
  return 1
}

cut -f2,3,6 /in/packages.tsv | sort -u | while IFS="$tab" read -r version origin commit; do
  dest=/out/src/$origin-$version
  [ -d "$dest" ] && continue
  echo "== $(date +%T) $origin $version (aports $commit)"
  recipe=$(fetch_recipe "$commit" "$origin") || {
    echo "error: no APKBUILD for $origin at aports commit $commit" >&2
    exit 1
  }
  mkdir -p "$dest"
  cp -R "$recipe"/. "$dest"/
  # fetch: download the sources; verify: check them against the recipe's checksums.
  (cd "$dest" && SRCDEST="$dest" abuild -F fetch && SRCDEST="$dest" abuild -F verify)
  rm -rf "$dest/src" # links abuild leaves behind; they only point inside this container
done

cp /in/packages.tsv /out/src/packages.tsv
cat > /out/src/README.txt <<EOF
Source code of the Linux system used by learnbash.dev
=====================================================

This archive contains the complete corresponding source code of every
package in the learnbash.dev virtual machine image (Alpine Linux
$ALPINE_BRANCH, 32-bit x86).

packages.tsv lists each binary package: name, version, source package,
license, homepage and the Alpine aports commit it was built from.

Each <source package>-<version>/ directory holds Alpine's build recipe
(APKBUILD, patches and config files) from that exact aports commit, plus the
upstream source files the recipe downloads, verified against the recipe's
checksums. Build with Alpine's abuild tool (https://wiki.alpinelinux.org/wiki/Abuild_and_Helpers).

How the image itself is assembled from these packages:
https://github.com/adneborresen/learnbash.dev/tree/main/image
EOF
tar -cf "/out/$ARCHIVE_NAME" -C /out/src .
echo "wrote $ARCHIVE_NAME ($(du -h "/out/$ARCHIVE_NAME" | cut -f1))"
