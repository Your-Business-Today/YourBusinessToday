"""Once the checks have answered: what has still to be committed before the files they were run on can be pushed."""
from __future__ import annotations

from clone import THE_OBJECT_NAMED, Clone
from folder_tree import ADDED, REMOVED, differencesBetween
from telling import tell, tellEach

WHAT_IS_COMMITTED = "HEAD^{tree}"
STILL_TO_COMMIT = {ADDED: "new", REMOVED: "deleted"}
STILL_TO_COMMIT_OTHERWISE = "changed"


def tellWhatToCommit(clone: Clone, checked: str) -> None:
    committed = clone.gitOrNothing(THE_OBJECT_NAMED, WHAT_IS_COMMITTED)
    if committed == checked:
        tell("the commit holds exactly the files the checks were run on, so it can be pushed.")
        return
    if not committed:
        tell("nothing is committed yet. Commit everything in the folder, and nothing else, and it can be pushed.")
        return
    tell("the commit does not yet hold the files the checks were run on. Commit all of this, and nothing else:")
    tellEach([inWords(difference.status, difference.path) for difference in differencesBetween(clone, committed, checked)])


def inWords(status: str, path: str) -> str:
    return f"{STILL_TO_COMMIT.get(status, STILL_TO_COMMIT_OTHERWISE)}: {path}"
