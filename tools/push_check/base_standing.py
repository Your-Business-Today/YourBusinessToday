"""Whether a clone's work holds what the branch it is to be merged into holds now.

GitHub's check on a pull request tests the work against its base as the base stood when the work was pushed, so two
pull requests that each pass alone can fail together once both are merged. The checks before a push are therefore run
only on work that holds its base as it stands now: the second of two such pull requests has to merge the first in,
and the two are tested together before either is pushed again. Where nothing can show how the work stands, the checks
are run all the same and the tool says so.
"""
from __future__ import annotations

from dataclasses import dataclass

from clone import Clone
from push_refusal import THE_COMMAND
from remote_branches import RemoteUnknown
from work_base import Base, baseOfTheWork

THE_WORK = "HEAD"
RUN_ALL_THE_SAME = "The checks are run all the same."


@dataclass(frozen=True)
class Standing:
    said: tuple[str, ...]
    isBehindItsBase: bool = False


def standingWithItsBase(clone: Clone, named: str | None) -> Standing:
    try:
        return standingWith(clone, baseOfTheWork(clone, named))
    except RemoteUnknown as unknown:
        return Standing((f"{unknown}, so nothing says whether this work holds its base. {RUN_ALL_THE_SAME}",))


def standingWith(clone: Clone, base: Base) -> Standing:
    shared = clone.gitOrNothing("merge-base", THE_WORK, base.commit)
    if shared == base.commit:
        return Standing((f"this work holds {base.tracked} as it stands now.",))
    if not shared:
        return Standing((notShownFor(base),))
    return Standing(refusalFor(base), isBehindItsBase=True)


def notShownFor(base: Base) -> str:
    return f"this clone holds no history that joins this work to {base.tracked}, so nothing shows whether the work holds it. {RUN_ALL_THE_SAME}"


def refusalFor(base: Base) -> tuple[str, ...]:
    return (
        f"the checks were not run: this work does not hold what {base.tracked} holds now.",
        f"bring it in with `git merge {base.tracked}`, and run this again.",
        f"work that is to be merged into another branch names it: `{THE_COMMAND} --base <branch>`.",
    )
