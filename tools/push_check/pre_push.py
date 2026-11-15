"""What git's pre-push hook is answered: whether each commit leaving the clone is one the checks have answered for.

A push is refused only where a branch is about to receive a commit its remote does not hold yet, and the files of
that commit are not ones the repository's checks passed on. Deleting a branch, pushing a tag and pushing a commit
the remote already holds are not new work, and pass. So does a commit that carries no checks file to pass, and one
whose checks said they cannot be run on this machine, each with a line saying it left unchecked.
"""
from __future__ import annotations

from clone import Clone
from exit_codes import DONE_EXIT, PUSH_REFUSED_EXIT
from passed_trees import LETS_A_PUSH_THROUGH, NOT_CHECKABLE_HERE, answerForTheFilesOf
from push_refusal import refuse
from pushes import Push, pushesIn
from repository_checks import CHECKS_FILE
from telling import tell

NOT_CHECKABLE_SAID = "the repository's checks could not be run on this machine. Say in the pull request what was not checked and why."


def answerThePush(clone: Clone, remote: str, lines: list[str]) -> int:
    refused = [push for push in pushesIn(lines) if not mayLeave(clone, remote, push)]
    for push in refused:
        refuse(clone, push)
    if refused:
        return PUSH_REFUSED_EXIT
    return DONE_EXIT


def mayLeave(clone: Clone, remote: str, push: Push) -> bool:
    if push.isDeletion or not push.isOfABranch:
        return True
    if not isNewToTheRemote(clone, remote, push.commit):
        return True
    if not carriesChecks(clone, push.commit):
        tell(f"{push.branch} is pushed unchecked: its commit carries no {CHECKS_FILE} for it to pass.")
        return True
    answer = answerForTheFilesOf(clone, push.commit)
    if answer == NOT_CHECKABLE_HERE:
        tell(f"{push.branch} is pushed unchecked: {NOT_CHECKABLE_SAID}")
    return answer in LETS_A_PUSH_THROUGH


def isNewToTheRemote(clone: Clone, remote: str, commit: str) -> bool:
    return bool(clone.git("rev-list --max-count=1", commit, "--not", f"--remotes={remote}"))


def carriesChecks(clone: Clone, commit: str) -> bool:
    return bool(clone.git("ls-tree --name-only", commit, "--", CHECKS_FILE.as_posix()))
