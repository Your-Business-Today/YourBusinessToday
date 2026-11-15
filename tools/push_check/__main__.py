"""The push check: git refuses a push until the repository's own checks have passed on exactly what is pushed.

Installed by the project-process kit as `tools/push_check`, and run from anywhere inside a clone:

    python3 tools/push_check [--base <branch>]
        runs scripts/check-before-push.sh on the working folder as it stands, remembers the files that passed,
        arms git in this clone, and says what is left to commit; it runs nothing on work that does not hold what
        its base holds now: the branch named, else staging where the remote has it, else the remote's default branch
    python3 tools/push_check merged [--base <branch>]
        says, once the work's pull request has merged, whether that base now holds files the checks passed on here
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
from typing import Callable

from arming import arm
from checking import check
from clone import Clone, GitRefused, cloneAround
from command_line import MERGED_COMMAND, withTheBaseSetApart
from exit_codes import DONE_EXIT, GIT_REFUSED_EXIT, USAGE_EXIT
from merged_base import answerForTheBase
from pre_push import answerThePush
from telling import SAID_BY, tell
from work_base import NoSuchBranch

RUN_AS_SCRIPT = "__main__"
ARM_COMMAND = "arm"
HOOK_COMMAND = "hook"
USAGE = "usage: python3 tools/push_check [merged] [--base <branch>], or python3 tools/push_check arm"


def main(arguments: list[str], folder: Path) -> int:
    words, namedBase = withTheBaseSetApart(arguments)
    if not words:
        return answerAboutTheWork(check, folder, namedBase)
    if words == [MERGED_COMMAND]:
        return answerAboutTheWork(answerForTheBase, folder, namedBase)
    command, *rest = arguments
    if command == ARM_COMMAND and not rest:
        return armTheClone(folder)
    if command == HOOK_COMMAND and rest:
        return answerGit(folder, remote=rest[0])
    tell(USAGE)
    return USAGE_EXIT


def answerAboutTheWork(answer: Callable[[Clone, str | None], int], folder: Path, namedBase: str | None) -> int:
    try:
        return answer(cloneAround(folder), namedBase)
    except NoSuchBranch as refusal:
        tell(str(refusal))
        return USAGE_EXIT
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
