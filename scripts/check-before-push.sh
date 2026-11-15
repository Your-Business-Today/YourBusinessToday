#!/usr/bin/env bash
# The checks this repository must pass before anything is pushed: what GitHub
# runs on a pull request, in the same order. .github/workflows/ci.yml is the one
# workflow that runs on a pull request, and scripts/checks/ci.sh runs what it
# runs. A step added to the workflow, or taken from it, is added to or taken
# from that file in the same pull request, and a second workflow that comes to
# run on pull requests gets a file of its own name beside it.
#
# `python3 tools/push_check` runs this file on the working folder, and git then
# refuses a push of anything it has not passed on. Work that would fail on
# GitHub fails here first, where nobody is emailed about it.
#
# The project-process kit wrote this file once and never changes it: it is this
# repository's to keep.
#
# A check that cannot be run on this machine at all is named at the end, and the
# file stops with exit 69. To the push check that is not a failure: the push is
# let through with a warning, and the pull request says what was not checked and
# why. One check can end so: the rehearsal of the next deploy's migrations, on a
# machine that cannot start a PostgreSQL server of its own.

set -euo pipefail

readonly cannotBeHadHere=69

# GitHub sets CI, and npm and the tools it runs decide by it.
export CI=true

# Each check adds a line to this file for what it could not check on this
# machine.
NOT_CHECKED_HERE="$(mktemp)"
export NOT_CHECKED_HERE
trap 'rm -f -- "$NOT_CHECKED_HERE"' EXIT

# Each job of the workflow installs the packages for itself. One install serves
# here.
npm ci
scripts/checks/ci.sh

if [ -s "$NOT_CHECKED_HERE" ]; then
	sed 's/^/Not checked on this machine: /; s/$/./' "$NOT_CHECKED_HERE" >&2
	exit "$cannotBeHadHere"
fi
