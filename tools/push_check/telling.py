"""What the push check has to say goes to standard error under its own name, so what the checks print stays theirs."""
from __future__ import annotations

import sys

SAID_BY = "Push check"
LISTED_AT_MOST = 10


def tell(sentence: str) -> None:
    sys.stderr.write(f"{SAID_BY}: {sentence}\n")


def tellEach(lines: list[str]) -> None:
    for line in lines[:LISTED_AT_MOST]:
        tell(f"    {line}")
    unlisted = len(lines) - LISTED_AT_MOST
    if unlisted > 0:
        tell(f"    and {unlisted} more")
