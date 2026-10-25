"""The rules: which invocations would move a protected branch, and what to say instead."""
from __future__ import annotations

WRITES_HISTORY = {"commit", "merge", "rebase", "cherry-pick", "revert", "am"}
REFERENCE_PREFIX = "refs/heads/"
ADMIN_OVERRIDE = "--admin"
PUSH = "push"
PULL_REQUEST = "pr"
MERGE = ["merge"]
CURRENT_HEAD = "HEAD"


def refuseGit(subcommand: str, arguments: list[str], branch: str | None, protectedBranches: list[str]) -> str | None:
    baseBranch = protectedBranches[-1]
    if subcommand in WRITES_HISTORY and branch in protectedBranches:
        return historyRefusal(subcommand, branch, baseBranch)
    if subcommand != PUSH:
        return None
    pushed = pushedProtectedBranch(arguments, branch, protectedBranches)
    if pushed is None:
        return None
    return pushRefusal(pushed, baseBranch)


def historyRefusal(subcommand: str, branch: str, baseBranch: str) -> str:
    return (
        f"Branch guard: `git {subcommand}` on `{branch}` is not allowed — `{branch}` only moves by a merged "
        f"pull request. Create a branch first: `git switch -c fix/<slug>` for a FIX task or "
        f"`git switch -c feature/<slug>` for a story, then commit there and open the pull request into `{baseBranch}`."
    )


def pushRefusal(pushed: str, baseBranch: str) -> str:
    return (
        f"Branch guard: this push would move `{pushed}`, which only moves by a merged pull request. Push the "
        f"fix/ or feature/ branch instead (`git push -u origin <branch>`) and open the pull request into "
        f"`{baseBranch}`; it merges once its checks pass."
    )


def pushedProtectedBranch(arguments: list[str], branch: str | None, protectedBranches: list[str]) -> str | None:
    references = [argument for argument in arguments if not argument.startswith("-")][1:]
    if not references:
        return branch if branch in protectedBranches else None
    for reference in references:
        destination = destinationOf(reference, branch)
        if destination in protectedBranches:
            return destination
    return None


def destinationOf(reference: str, branch: str | None) -> str | None:
    destination = reference.split(":")[-1] if ":" in reference else reference
    destination = destination.removeprefix("+").removeprefix(REFERENCE_PREFIX)
    if destination == CURRENT_HEAD:
        return branch
    return destination


def refuseGithubMerge(subcommand: str, arguments: list[str]) -> str | None:
    if subcommand == PULL_REQUEST and arguments[:1] == MERGE and ADMIN_OVERRIDE in arguments:
        return (
            "Branch guard: `gh pr merge --admin` is not allowed — it overrides the repository's protections. "
            "Merge once CI is green (`gh pr merge --merge`, or `--auto` to merge when checks pass), and if a "
            "person's approval is required, say on the task that the pull request waits on them."
        )
    return None
