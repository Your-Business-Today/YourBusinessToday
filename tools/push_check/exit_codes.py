"""How the push check stops: the exit code a shell, a checks file or git's hook reads from it.

Running the checks stops with 0 when they passed and with their own code when they failed. A checks file stops with
69 to say it cannot be run on this machine at all, which is not the same as failing. Git's hook is refused with 77
and with nothing else, so that a fault in the tool can never be mistaken for a refusal. Work that does not hold what
its base holds now stops the tool with 65 before any check is run, and a base that holds files the checks have not
been run on in this clone is answered with 66.
"""
from __future__ import annotations

DONE_EXIT = 0
USAGE_EXIT = 64
BEHIND_ITS_BASE_EXIT = 65
BASE_NOT_CHECKED_EXIT = 66
NOT_RUNNABLE_HERE_EXIT = 69
GIT_REFUSED_EXIT = 70
CHECKS_CHANGED_THE_FOLDER_EXIT = 75
PUSH_REFUSED_EXIT = 77
NO_CHECKS_EXIT = 78
NOT_STARTED_EXIT = 127
EXIT_WHEN_A_SIGNAL_ENDS_IT = 128
