#!/bin/sh
# Compatibility entry point; all project commands now run locally with Mise.
set -eu
exec "$(dirname "$0")/in-environment.sh" "$@"
