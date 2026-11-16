"""What git says is about to leave the clone: one line for each ref, as its pre-push hook is handed them."""
from __future__ import annotations

from dataclasses import dataclass

BRANCHES = "refs/heads/"
NO_COMMIT = "0"
ONCE = 1


@dataclass(frozen=True)
class Push:
    localRef: str
    commit: str
    remoteRef: str
    commitOnTheRemote: str

    @property
    def isDeletion(self) -> bool:
        return set(self.commit) == {NO_COMMIT}

    @property
    def isOfABranch(self) -> bool:
        return self.remoteRef.startswith(BRANCHES)

    @property
    def branch(self) -> str:
        return self.remoteRef.replace(BRANCHES, "", ONCE)


def pushesIn(lines: list[str]) -> list[Push]:
    return [Push(*line.split()) for line in lines if line.strip()]
