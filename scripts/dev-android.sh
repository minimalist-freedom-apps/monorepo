#!/usr/bin/env bash
set -euo pipefail

if [[ -r /dev/tty ]]; then
	./node_modules/.bin/cap run android </dev/tty
else
	./node_modules/.bin/cap run android
fi
