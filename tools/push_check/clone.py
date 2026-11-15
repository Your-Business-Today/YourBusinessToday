"""The clone a push leaves from: its working folder, and what git answers when asked about it.

A question is put to git the way it is typed, `clone.git("rev-parse --verify --quiet", commit)`: the words of
the command first, in one string, then whatever it is asked about, each as an argument of its own so a path or
a ref is never split. Git is run in the working folder with the environment it was given, so inside a hook it
sees the same clone, worktree included, that the push is leaving from.
"""
from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path

CANNOT_ANSWER = (subprocess.CalledProcessError, OSError)
HOOKS = "hooks"
THE_OBJECT_NAMED = "rev-parse --verify --quiet"


class GitRefused(Exception):
    """Git would not do what the push check asked of it."""


@dataclass(frozen=True)
class Clone:
    root: Path

    def git(self, words: str, *subjects: str, environment: dict[str, str] | None = None) -> str:
        command = ["git", "-C", str(self.root), *words.split(), *subjects]
        try:
            finished = subprocess.run(
                command, capture_output=True, check=True, env=environment, encoding="utf-8", errors="replace"
            )
        except CANNOT_ANSWER as failure:
            raise GitRefused(f"`git {words}` did not work in {self.root}: {whatWentWrong(failure)}") from failure
        return finished.stdout.rstrip("\n")

    def gitOrNothing(self, words: str, *subjects: str) -> str:
        try:
            return self.git(words, *subjects)
        except GitRefused:
            return ""

    def ownGitPath(self, name: str) -> Path:
        return self.resolved(self.git("rev-parse --git-path", name))

    @property
    def folderItsWorktreesShare(self) -> Path:
        return self.resolved(self.git("rev-parse --git-common-dir"))

    @property
    def hooksFolder(self) -> Path:
        return self.ownGitPath(HOOKS)

    @property
    def keepsItsOwnHooks(self) -> bool:
        return bool(self.gitOrNothing("config --get core.hooksPath"))

    def resolved(self, pathFromGit: str) -> Path:
        return (self.root / pathFromGit).resolve()


def cloneAround(folder: Path) -> Clone:
    root = Clone(folder).git("rev-parse --show-toplevel")
    return Clone(Path(root))


def whatWentWrong(failure: Exception) -> str:
    said = getattr(failure, "stderr", None) or str(failure)
    return " ".join(said.split())
