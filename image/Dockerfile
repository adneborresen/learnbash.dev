# Builds the learnbash guest: a 32-bit Alpine root filesystem packed as an
# initramfs, plus the kernel. Output (via `docker build --output`):
#   vmlinuz      - kernel (bzImage)
#   initrd.gz    - whole root filesystem (lives in RAM inside the VM)
ARG ALPINE_VERSION=3.22

FROM alpine:${ALPINE_VERSION} AS rootfs
# GNU tools so learners use the same commands as on Ubuntu/Debian servers.
RUN apk add --no-cache \
      linux-virt \
      bash bash-completion coreutils findutils grep sed gawk diffutils \
      less procps-ng ncurses-terminfo-base tree nano
RUN adduser -D -s /bin/bash -h /home/learner learner \
 && passwd -d learner >/dev/null \
 && echo learnbash > /etc/hostname
COPY overlay/ /
RUN chmod 755 /usr/local/lib/learnbash/* /etc/learnbash-init \
 && chmod 700 /root \
 # The kernel is shipped separately; modules/firmware are not needed (all
 # drivers we rely on are built in) and docs only cost download size.
 && mkdir /out && mv /boot/vmlinuz-virt /out/vmlinuz \
 && rm -rf /boot /lib/modules /lib/firmware /usr/share/doc /usr/share/man \
           /usr/share/info /var/cache/apk /etc/apk /lib/apk /sbin/apk

FROM alpine:${ALPINE_VERSION} AS packer
RUN apk add --no-cache cpio gzip
COPY --from=rootfs / /rootfs
RUN mkdir /out && mv /rootfs/out/vmlinuz /out/vmlinuz && rmdir /rootfs/out \
 && ln -sf /sbin/init /rootfs/init \
 && cd /rootfs && find . -xdev | sort | cpio -o -H newc --quiet | gzip -9 > /out/initrd.gz

FROM scratch
COPY --from=packer /out/ /
