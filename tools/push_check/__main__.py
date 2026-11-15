"""The push check: git refuses a push until the repository's own checks have passed on exactly what is pushed.

Installed by the project-process kit as `tools/push_check`, and run from anywhere inside a clone:

    python3 tools/push_check
        runs scripts/check-before-push.sh on the working folder as it stands, remembers the files that passed,
        arms git in this clone, and says what is left to commit
    python3 tools/push_check arm
        arms git in this clone and nothing else; the hook the kit registers for the start of a Claude Code
        session runs this, and it says nothing once git is armed
    python3 tools/push_check hook
        what git's pre-push hook asks about a push; nobody types this

What passed is remembered as a git tree, inside the clone's git folder, so it never travels with a push and a commit
passes only when its files are exactly the ones the checks were run on. The exit codes are in exit_codes.py.

Three ways round it are not guarded: `git push --no-verify`, files put on a branch through GitHub's API, and a record
written by hand. The kit's working process forbids each, but for the one push it names: work that has to stop while a
check still fails, which is pushed all the same, and says so, rather than lost.
"""
from __future__ import annotations

import sys
from pathlib import Path

from arming import arm
from checking import check
from clone import GitRefused, cloneAround
from exit_codes import DONE_EXIT, GIT_REFUSED_EXIT, USAGE_EXIT
from pre_push import answerThePush
from telling import SAID_BY, tell

RUN_AS_SCRIPT = "__main__"
ARM_COMMAND = "arm"
HOOK_COMMAND = "hook"
USAGE = "usage: python3 tools/push_check [arm]"


def main(arguments: list[str], folder: Path) -> int:
    if not arguments:
        return runTheChecks(folder)
    command, *rest = arguments
    if command == ARM_COMMAND and not rest:
        return armTheClone(folder)
    if command == HOOK_COMMAND and rest:
        return answerGit(folder, remote=rest[0])
    tell(USAGE)
    return USAGE_EXIT


def runTheChecks(folder: Path) -> int:
    try:
        return check(cloneAround(folder))
    except GitRefused as refusal:
        tell(str(refusal))
        return GIT_REFUSED_EXIT


def armTheClone(folder: Path) -> int:
    try:
        arming = arm(cloneAround(folder))
    except GitRefused:
        return DONE_EXIT
    if not arming.isArmed:
        print(f"{SAID_BY}: {arming.notice}")
    return DONE_EXIT


def answerGit(folder: Path, remote: str) -> int:
    try:
        return answerThePush(cloneAround(folder), remote, sys.stdin.read().splitlines())
    except Exception as fault:
        tell(f"this push could not be checked ({fault}), so it is let through unchecked.")
        return DONE_EXIT


if __name__ == RUN_AS_SCRIPT:
    sys.exit(main(sys.argv[1:], Path.cwd()))
