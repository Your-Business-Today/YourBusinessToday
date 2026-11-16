"""What a refused push is told: which commit, how far it is from what the checks last passed on, and what to run."""
from __future__ import annotations

from clone import Clone, GitRefused
from folder_tree import ADDED, REMOVED, Difference, differencesBetween
from passed_trees import lastPassed
from pushes import Push
from telling import tell, tellEach

THE_COMMAND = "python3 tools/push_check"
LETTERS_OF_A_SHORT_COMMIT = 9
SINCE_THE_CHECKS = {ADDED: "not there when the checks ran", REMOVED: "left out of the commit"}
SINCE_THE_CHECKS_OTHERWISE = "changed since the checks ran"


def refuse(clone: Clone, push: Push) -> None:
    commit = push.commit[:LETTERS_OF_A_SHORT_COMMIT]
    tell(f"the push of {push.branch} is refused: the repository's checks have not passed on commit {commit}.")
    tellHowFarItIs(clone, push.commit)
    tell(f"run `{THE_COMMAND}` from the repository's root, commit exactly what it was run on, and push again.")


def tellHowFarItIs(clone: Clone, commit: str) -> None:
    passed = lastPassed(clone)
    if passed is None:
        tell("the checks have not passed in this working folder yet.")
        return
    differences = differencesOrNone(clone, passed, commit)
    if not differences:
        return
    tell("this is how that commit differs from the files the checks last passed on:")
    tellEach([inWords(difference.status, difference.path) for difference in differences])


def differencesOrNone(clone: Clone, passed: str, commit: str) -> list[Difference]:
    try:
        return differencesBetween(clone, passed, commit)
    except GitRefused:
        return []


def inWords(status: str, path: str) -> str:
    return f"{path}: {SINCE_THE_CHECKS.get(status, SINCE_THE_CHECKS_OTHERWISE)}"
