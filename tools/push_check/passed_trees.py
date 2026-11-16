"""What the repository's checks answered for each tree they were run on.

The answers are kept in the git folder every worktree of the clone shares, so they never travel with a push and
a tree that passed in one worktree has passed in them all. The tree the checks last passed on is kept for each
worktree alone, so a refusal can say how far a commit is from it.
"""
from __future__ import annotations

from pathlib import Path

from clone import THE_OBJECT_NAMED, Clone

PASSED = "passed"
NOT_CHECKABLE_HERE = "could not be checked on this machine"
LETS_A_PUSH_THROUGH = (PASSED, NOT_CHECKABLE_HERE)
ANSWERS = "push-check"
LAST_PASSED = "push-check-last-passed"


def remember(clone: Clone, tree: str, answer: str) -> None:
    answers = clone.folderItsWorktreesShare / ANSWERS
    answers.mkdir(parents=True, exist_ok=True)
    (answers / tree).write_text(f"{answer}\n", encoding="utf-8")
    if answer == PASSED:
        clone.ownGitPath(LAST_PASSED).write_text(f"{tree}\n", encoding="utf-8")


def answerFor(clone: Clone, tree: str) -> str | None:
    return onlyLineOf(clone.folderItsWorktreesShare / ANSWERS / tree)


def answerForTheFilesOf(clone: Clone, commit: str) -> str | None:
    return answerFor(clone, clone.git(THE_OBJECT_NAMED, f"{commit}^{{tree}}"))


def lastPassed(clone: Clone) -> str | None:
    return onlyLineOf(clone.ownGitPath(LAST_PASSED))


def onlyLineOf(file: Path) -> str | None:
    if not file.is_file():
        return None
    return file.read_text(encoding="utf-8").strip() or None
