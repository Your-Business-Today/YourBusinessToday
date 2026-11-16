"""The repository's own checks: one file the repository keeps, run here the way its check on GitHub runs it.

The file is run with bash from the top of the working folder, with nothing to read on standard input, and whatever
it prints goes straight to whoever ran the push check.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

from exit_codes import EXIT_WHEN_A_SIGNAL_ENDS_IT, NOT_STARTED_EXIT
from telling import tell

CHECKS_FILE = Path("scripts") / "check-before-push.sh"
SHELL = "bash"


def hasChecks(root: Path) -> bool:
    return (root / CHECKS_FILE).is_file()


def exitCodeOfTheChecks(root: Path) -> int:
    try:
        finished = subprocess.run([SHELL, str(CHECKS_FILE)], cwd=root, stdin=subprocess.DEVNULL, check=False)
    except OSError as failure:
        tell(f"{SHELL} could not be started to run {CHECKS_FILE} ({failure}).")
        return NOT_STARTED_EXIT
    if finished.returncode < 0:
        return EXIT_WHEN_A_SIGNAL_ENDS_IT - finished.returncode
    return finished.returncode
