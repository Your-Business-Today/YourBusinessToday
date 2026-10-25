"""The branch guard: nothing lands on the default branch, or on staging, from a Claude session.

Installed by the project-process kit as a Claude Code PreToolUse hook on the Bash tool
(.claude/settings.json), run as `python3 tools/branch_guard`. Claude Code hands the tool call
to stdin as JSON; the guard reads the command, follows any checkout or switch it makes, and
refuses — exit 2, the reason on stderr — any commit, merge, rebase, cherry-pick or revert that
would write to a protected branch (the default branch, and `staging` where the repository has one),
any push that would move one, and any pull-request merge that overrides the repository's protections.
Everything else passes, and a guard that breaks lets the command through rather than the shell down.
"""
from __future__ import annotations

import json
import os
import re
import sys

from command_parser import invocationsIn, branchAfterSwitch
from refusals import refuseGit, refuseGithubMerge
from repository import currentBranchOf, protectedBranchesOf

BLOCKED_EXIT = 2
BASH_TOOL = "Bash"
GITHUB_CLI = "gh"
RUN_AS_SCRIPT = "__main__"
MENTIONS_GIT = re.compile(r"\b(git|gh)\b")


def main() -> int:
    payload = readPayload()
    if payload is None or payload.get("tool_name") != BASH_TOOL:
        return 0
    command = str(payload.get("tool_input", {}).get("command", ""))
    if not MENTIONS_GIT.search(command):
        return 0
    repository = payload.get("cwd") or os.getcwd()
    protectedBranches = protectedBranchesOf(repository)
    if protectedBranches is None:
        return 0
    refusal = firstRefusal(command, currentBranchOf(repository), protectedBranches)
    if refusal is None:
        return 0
    sys.stderr.write(refusal + "\n")
    return BLOCKED_EXIT


def readPayload() -> dict | None:
    try:
        return json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return None


def firstRefusal(command: str, branch: str | None, protectedBranches: list[str]) -> str | None:
    for program, subcommand, arguments in invocationsIn(command):
        isGithubCli = program == GITHUB_CLI
        if not isGithubCli:
            branch = branchAfterSwitch(subcommand, arguments, branch)
        refusal = refuseGithubMerge(subcommand, arguments) if isGithubCli else refuseGit(subcommand, arguments, branch, protectedBranches)
        if refusal:
            return refusal
    return None


if __name__ == RUN_AS_SCRIPT:
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
