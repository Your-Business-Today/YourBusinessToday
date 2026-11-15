"""Whether the branch a clone's work was merged into holds files the checks have answered for in this clone.

Work is checked while it holds its base, so where nothing else was merged alongside it the base holds, once the work
is merged, exactly the files the checks passed on, and the answer is yes at once. Where something else was merged in
the meantime the base holds files nobody has checked together, because GitHub checked each pull request against the
base as it stood at that pull request's own push. The answer is then no, with how to check what the base holds now.
"""
from __future__ import annotations

from clone import Clone
from exit_codes import BASE_NOT_CHECKED_EXIT, DONE_EXIT, GIT_REFUSED_EXIT
from passed_trees import NOT_CHECKABLE_HERE, PASSED, answerForTheFilesOf
from push_refusal import THE_COMMAND
from remote_branches import RemoteUnknown
from telling import tell
from work_base import Base, baseOfTheWork

HOLDS_THE_FILES = {
    PASSED: "the checks passed on in this clone",
    NOT_CHECKABLE_HERE: "the checks were asked about in this clone, where they could not be run",
}
MERGED_ALONGSIDE = "Where this work's pull request has merged, something else was merged alongside it."
A_FAILURE_THERE = "A failure there is a task of its own."


def answerForTheBase(clone: Clone, named: str | None) -> int:
    try:
        return answerForWhatItHolds(clone, baseOfTheWork(clone, named))
    except RemoteUnknown as unknown:
        tell(f"{unknown}, so nothing says what the base of this work holds now.")
        return GIT_REFUSED_EXIT


def answerForWhatItHolds(clone: Clone, base: Base) -> int:
    held = HOLDS_THE_FILES.get(answerForTheFilesOf(clone, base.commit))
    if held is None:
        tellItIsNotChecked(base)
        return BASE_NOT_CHECKED_EXIT
    tell(f"{base.tracked} holds exactly the files {held}.")
    return DONE_EXIT


def tellItIsNotChecked(base: Base) -> None:
    tell(f"{base.tracked} holds files the checks have not been run on in this clone. {MERGED_ALONGSIDE}")
    tell(f"check what it holds now: `git switch --detach {base.tracked}`, then `{THE_COMMAND}`. {A_FAILURE_THERE}")
