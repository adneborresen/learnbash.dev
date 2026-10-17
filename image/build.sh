#!/bin/sh
# Builds build/image/{vmlinuz,initrd.gz} with Docker.
set -eu
cd "$(dirname "$0")/.."
docker build --platform linux/386 --output type=local,dest=build/image image
ls -l build/image
