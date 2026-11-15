"""What a remote says of its branches now, and a branch of it brought into the clone as it stands now.

The remote is asked each time, so the answer is never what this clone last fetched of it. Git is not left waiting for
someone to type a password, and its own words for a remote that does not answer are not repeated, since the address
of a remote can carry a credential.
"""
from __future__ import annotations

import os

from clone import THE_OBJECT_NAMED, Clone, GitRefused
from pushes import BRANCHES, ONCE

LISTED = "ls-remote"
LISTED_WITH_ITS_POINTERS = "ls-remote --symref"
HEAD_OF_THE_REMOTE = "HEAD"
TAB = "\t"
POINTS_AT_A_BRANCH = f"ref: {BRANCHES}"
POINTED_AT_BY_HEAD = f"{TAB}{HEAD_OF_THE_REMOTE}"
TRACKED = "refs/remotes/"
WITHOUT_A_PROMPT = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}


class RemoteUnknown(GitRefused):
    """The remote did not say what it holds now: there is none, it did not answer, or it names no default branch."""


def hasBranch(clone: Clone, remote: str, branch: str) -> bool:
    ref = f"{BRANCHES}{branch}"
    shown = shownBy(clone, LISTED, remote, ref)
    return any(line.endswith(f"{TAB}{ref}") for line in shown)


def defaultBranchOf(clone: Clone, remote: str) -> str:
    shown = shownBy(clone, LISTED_WITH_ITS_POINTERS, remote, HEAD_OF_THE_REMOTE)
    pointers = [line for line in shown if line.startswith(POINTS_AT_A_BRANCH)]
    if not pointers:
        raise RemoteUnknown(f"{remote} does not say which branch is its default")
    return pointers[0].replace(POINTS_AT_A_BRANCH, "", ONCE).replace(POINTED_AT_BY_HEAD, "", ONCE)


def fetched(clone: Clone, remote: str, branch: str) -> str:
    """Brings the branch into this clone as the remote holds it now, and answers the commit it holds."""
    tracking = f"{TRACKED}{remote}/{branch}"
    try:
        clone.git("fetch --quiet", remote, f"+{BRANCHES}{branch}:{tracking}", environment=WITHOUT_A_PROMPT)
    except GitRefused:
        raise RemoteUnknown(f"{remote} could not be asked what {branch} holds") from None
    return clone.git(THE_OBJECT_NAMED, tracking)


def shownBy(clone: Clone, listed: str, remote: str, ref: str) -> list[str]:
    try:
        return clone.git(listed, remote, ref, environment=WITHOUT_A_PROMPT).splitlines()
    except GitRefused:
        raise RemoteUnknown(f"{remote} could not be asked what its branches hold") from None
