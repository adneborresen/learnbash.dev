#!/bin/sh
# Lints every shell script that ends up in (or builds) the VM image, plus all
# challenge scripts. Uses a local shellcheck if installed, otherwise the
# pinned Docker image.
set -eu
cd "$(dirname "$0")/.."
image_files=$(find image scripts -type f \( -name '*.sh' -o -path 'image/overlay/*' \) \
                ! -name '*.md' ! -name inittab ! -name hostname | sort)
# Challenge setup/check scripts source the VM's helper libraries (SC1091: not
# available on the host).
challenge_scripts=$(find challenges -type f \( -name setup.sh -o -name check.sh \) | sort)
# Solutions and wrong attempts are commands a learner types one by one, so
# script-only advice (SC2164: "cd ... || exit", SC2103: use a subshell) is off.
typed_files=$(find challenges -type f \( -name solution.sh -o -path '*/wrong/*.sh' \) | sort)

run() {
  if command -v shellcheck >/dev/null 2>&1; then
    shellcheck "$@"
  else
    MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd)":/mnt -w /mnt koalaman/shellcheck:v0.10.0 "$@"
  fi
}
# shellcheck disable=SC2086 # word splitting of the file lists is intended
run $image_files
# shellcheck disable=SC2086
[ -z "$challenge_scripts" ] || run --shell=bash --exclude=SC1091 $challenge_scripts
# shellcheck disable=SC2086
[ -z "$typed_files" ] || run --shell=bash --exclude=SC1091,SC2164,SC2103 $typed_files
count() { echo "$1" | grep -c . || true; }
echo "shellcheck OK: $(count "$image_files") image, $(count "$challenge_scripts") challenge, $(count "$typed_files") typed-command files"
