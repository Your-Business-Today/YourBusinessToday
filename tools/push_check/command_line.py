"""The words the push check is run with, and the base they may name.

`--base <branch>` closes the command line of the two commands that read a base: the check itself, which has no word of
its own, and `merged`. It names the branch the work is to be merged into where that is not the one the remote gives.
"""
from __future__ import annotations

MERGED_COMMAND = "merged"
BASE_OPTION = "--base"
WORDS_THAT_NAME_A_BASE = 2


def withTheBaseSetApart(arguments: list[str]) -> tuple[list[str], str | None]:
    words, namingABase = arguments[:-WORDS_THAT_NAME_A_BASE], arguments[-WORDS_THAT_NAME_A_BASE:]
    if namingABase[:1] != [BASE_OPTION] or len(namingABase) != WORDS_THAT_NAME_A_BASE:
        return arguments, None
    return words, namingABase[-1]
