"""What git says about the repository the command runs in."""
from __future__ import annotations

import subprocess

GIT_TRUE = "true"
STAGING_BRANCH = "staging"
LOCAL_BRANCHES = "refs/heads/"
REMOTE_BRANCHES = "refs/remotes/origin/"


def protectedBranchesOf(repository: str) -> list[str] | None:
    defaultBranch = defaultBranchOf(repository)
    if defaultBranch is None:
        return None
    if hasBranch(repository, STAGING_BRANCH):
        return [defaultBranch, STAGING_BRANCH]
    return [defaultBranch]


def defaultBranchOf(repository: str) -> str | None:
    if git(repository, "rev-parse", "--is-inside-work-tree") != GIT_TRUE:
        return None
    origin = git(repository, "symbolic-ref", "--short", f"{REMOTE_BRANCHES}HEAD")
    if origin:
        return origin.removeprefix("origin/")
    for candidate in ("main", "master"):
        if hasLocalBranch(repository, candidate):
            return candidate
    return "main"


def hasBranch(repository: str, name: str) -> bool:
    isOnOrigin = bool(git(repository, "rev-parse", "--verify", "--quiet", f"{REMOTE_BRANCHES}{name}"))
    return isOnOrigin or hasLocalBranch(repository, name)


def hasLocalBranch(repository: str, name: str) -> bool:
    return bool(git(repository, "rev-parse", "--verify", "--quiet", f"{LOCAL_BRANCHES}{name}"))


def currentBranchOf(repository: str) -> str | None:
    return git(repository, "symbolic-ref", "--short", "HEAD") or None


def git(repository: str, *arguments: str) -> str:
    try:
        completed = subprocess.run(
            ["git", "-C", repository, *arguments], capture_output=True, text=True, check=False
        )
    except OSError:
        return ""
    return completed.stdout.strip() if completed.returncode == 0 else ""
