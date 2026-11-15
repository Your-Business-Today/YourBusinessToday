"""Running the repository's checks on the working folder as it stands, and remembering what they answered.

The checks are run only on work that holds what its base holds now, so no time goes on work whose answer would not
stand once it is merged. The folder is read as one tree before the checks run, and again once they have answered. A
file the checks changed or removed means what is there now is not what they answered for, so nothing is remembered. A
file they only added is a by-product: it is no part of what was checked, and is named so that it is left out of the
commit and ignored.
"""
from __future__ import annotations

from arming import arm
from base_standing import standingWithItsBase
from clone import Clone
from commit_advice import tellWhatToCommit
from exit_codes import BEHIND_ITS_BASE_EXIT, CHECKS_CHANGED_THE_FOLDER_EXIT, DONE_EXIT, NO_CHECKS_EXIT, NOT_RUNNABLE_HERE_EXIT
from folder_tree import ADDED, differencesBetween, treeOfTheFolder
from passed_trees import NOT_CHECKABLE_HERE, PASSED, remember
from repository_checks import CHECKS_FILE, exitCodeOfTheChecks, hasChecks
from telling import tell, tellEach

ANSWER_FOR_EXIT = {DONE_EXIT: PASSED, NOT_RUNNABLE_HERE_EXIT: NOT_CHECKABLE_HERE}
SAID_AFTER = {
    PASSED: "the checks passed on the working folder as it stands.",
    NOT_CHECKABLE_HERE: (
        "the checks could not be run on this machine. A push of exactly these files is let through unchecked: "
        "say in the pull request what was not checked and why."
    ),
}
NO_CHECKS = f"this repository has no {CHECKS_FILE}, so there are no checks to run. The kit's bootstrap writes one."
CHECKS_CHANGED_THE_FOLDER = (
    "the checks changed files they were checking, so what is in the folder now is not what they answered for. "
    "Nothing was recorded: run this again."
)
BY_PRODUCTS_LEFT = (
    "the checks left files behind that git does not ignore. They are no part of what was checked, so leave them "
    "out of the commit, and have git ignore them: the next run would take them for work to be committed."
)


def check(clone: Clone, namedBase: str | None) -> int:
    arming = arm(clone)
    if arming.notice:
        tell(arming.notice)
    if not hasChecks(clone.root):
        tell(NO_CHECKS)
        return NO_CHECKS_EXIT
    standing = standingWithItsBase(clone, namedBase)
    for sentence in standing.said:
        tell(sentence)
    if standing.isBehindItsBase:
        return BEHIND_ITS_BASE_EXIT
    return checkTheFolder(clone)


def checkTheFolder(clone: Clone) -> int:
    checked = treeOfTheFolder(clone)
    exitCode = exitCodeOfTheChecks(clone.root)
    answer = ANSWER_FOR_EXIT.get(exitCode)
    if answer is None:
        tell(f"the checks failed (exit {exitCode}). Nothing was recorded, so a push of this work is refused: fix it and run this again.")
        return exitCode
    leftBehind = differencesBetween(clone, checked, treeOfTheFolder(clone))
    rewritten = [difference.path for difference in leftBehind if difference.status != ADDED]
    if rewritten:
        tell(CHECKS_CHANGED_THE_FOLDER)
        tellEach(rewritten)
        return CHECKS_CHANGED_THE_FOLDER_EXIT
    remember(clone, checked, answer)
    tell(SAID_AFTER[answer])
    tellWhatToCommit(clone, checked)
    tellOfByProducts([difference.path for difference in leftBehind])
    return exitCode


def tellOfByProducts(paths: list[str]) -> None:
    if not paths:
        return
    tell(BY_PRODUCTS_LEFT)
    tellEach(paths)
