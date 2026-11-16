"""The branch a clone's work is to be merged into, brought into the clone as the remote holds it now.

That is `staging` where the remote has one and the remote's default branch where it has not, unless the work names
another: the one urgent fix that goes into the default branch does.
"""
from __future__ import annotations

from dataclasses import dataclass

from clone import Clone
from remote_branches import RemoteUnknown, defaultBranchOf, fetched, hasBranch

STAGING = "staging"
PREFERRED_REMOTE = "origin"


class NoSuchBranch(Exception):
    """The branch the work names as its base is not on the remote."""


@dataclass(frozen=True)
class Base:
    tracked: str
    commit: str
    isStaging: bool


def baseOfTheWork(clone: Clone, named: str | None) -> Base:
    remote = remoteOf(clone)
    branch = branchToMergeInto(clone, remote, named)
    return Base(f"{remote}/{branch}", fetched(clone, remote, branch), isStaging=branch == STAGING)


def remoteOf(clone: Clone) -> str:
    remotes = clone.git("remote").splitlines()
    if not remotes:
        raise RemoteUnknown("this clone has no remote")
    if PREFERRED_REMOTE in remotes:
        return PREFERRED_REMOTE
    return remotes[0]


def branchToMergeInto(clone: Clone, remote: str, named: str | None) -> str:
    if named:
        return theNamed(clone, remote, named)
    if hasBranch(clone, remote, STAGING):
        return STAGING
    return defaultBranchOf(clone, remote)


def theNamed(clone: Clone, remote: str, named: str) -> str:
    if not hasBranch(clone, remote, named):
        raise NoSuchBranch(f"{remote} has no branch {named}.")
    return named
