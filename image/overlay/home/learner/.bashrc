# ~/.bashrc for the learner, modelled on Ubuntu's defaults.
# shellcheck shell=bash

# Not interactive? Do nothing.
[[ $- == *i* ]] || return

HISTCONTROL=ignoreboth
HISTSIZE=1000
shopt -s histappend checkwinsize

# Coloured prompt: user@host:directory$
PS1='\[\e[01;32m\]\u@\h\[\e[00m\]:\[\e[01;34m\]\w\[\e[00m\]\$ '

# Colours for ls and grep, like on Ubuntu.
alias ls='ls --color=auto'
alias grep='grep --color=auto'

# Tab completion is already loaded by Alpine's /etc/bash/bashrc.
