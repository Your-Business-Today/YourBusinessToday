#!/usr/bin/env bash
# The checks this repository must pass before anything is pushed.
#
# `python3 tools/push_check` runs this file on the working folder, and git then refuses a push of anything it has
# not passed on. Work that would fail the required check on GitHub fails here first, where nobody is emailed
# about it: the kit's own workflow runs this same file, and a repository whose required check is a workflow of
# its own makes this file run what that workflow runs, in the same order, leaving out only what needs a secret.
#
# The project-process kit wrote this file once and never changes it: it is this repository's to keep.
#
# Stop with `exit 69` when a check cannot be run on this machine at all, for want of a toolchain that cannot be
# had here. To the push check that is not a failure: the push is let through with a warning, and the pull request
# says what was not checked and why. `python3 tools/dotnet_sdk dotnet ...` already stops with 69 when the .NET
# SDK cannot be had.
set -euo pipefail

python3 -m unittest discover -s tools/refactor/audit/tests -t .
