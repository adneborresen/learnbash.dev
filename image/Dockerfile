# Builds the learnbash guest: a 32-bit Alpine root filesystem packed as an
# initramfs, plus the kernel. Output (via `docker build --output`):
#   vmlinuz        - kernel (bzImage)
#   initrd.gz      - whole root filesystem (lives in RAM inside the VM)
#   packages.txt   - exact Alpine package versions inside the image
#   alpine-release - Alpine version
#
# The base image is pinned by digest. Alpine's package repositories only keep
# the latest build of each package in a stable branch, so package versions can
# still move forward (security fixes) between builds; packages.txt records
# exactly what each image contains.
ARG ALPINE=alpine:3.22.6@sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8

FROM ${ALPINE} AS rootfs
# GNU tools so learners use the same commands as on Ubuntu/Debian servers.
RUN apk add --no-cache \
      linux-virt \
      bash bash-completion coreutils findutils grep sed gawk diffutils \
      less procps-ng ncurses-terminfo-base tree nano
RUN adduser -D -s /bin/bash -h /home/learner learner \
 && passwd -d learner >/dev/null \
 && echo learnbash > /etc/hostname
COPY overlay/ /
RUN chown -R learner:learner /home/learner
RUN chmod 755 /usr/local/lib/learnbash/* /etc/learnbash-init \
 && chmod 700 /root \
 && mkdir /out \
 && apk info -v | sort > /out/packages.txt \
 && cp /etc/alpine-release /out/alpine-release \
 # The kernel is shipped separately; modules/firmware are not needed (all
 # drivers we rely on are built in); docs and the package manager only cost
 # download size (the VM has no network anyway).
 && mv /boot/vmlinuz-virt /out/vmlinuz \
 && rm -rf /boot /lib/modules /lib/firmware /usr/share/doc /usr/share/man \
           /usr/share/info /var/cache/apk /etc/apk /lib/apk /sbin/apk

FROM ${ALPINE} AS packer
RUN apk add --no-cache cpio gzip coreutils
COPY --from=rootfs / /rootfs
RUN mv /rootfs/out /out \
 && ln -sf /sbin/init /rootfs/init \
 # Fixed timestamps and sorted file list keep the archive stable across builds.
 && find /rootfs -exec touch -h -d @0 {} + \
 && cd /rootfs && find . -xdev | sort | cpio -o -H newc --quiet --reproducible \
    | gzip -9 -n > /out/initrd.gz

FROM scratch
COPY --from=packer /out/ /
