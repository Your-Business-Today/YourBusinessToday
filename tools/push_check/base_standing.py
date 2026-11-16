"""Whether a clone's work holds what the branch it is to be merged into holds now.

GitHub's check on a pull request tests the work against its base as the base stood when the work was pushed, so two
pull requests that each pass alone can fail together once both are merged. The checks before a push are therefore run
only on work that holds its base as it stands now: the second of two such pull requests has to merge the first in,
and the two are tested together before either is pushed again. Where nothing can show how the work stands, the checks
are run all the same and the tool says so.

Where the base is `staging` the work is also told that its pull request goes into it. A session whose clone fetched
the default branch alone sees no `staging` beside it, and straight after a promotion the two branches hold the same
files, so work cut from the default branch holds its base and nothing else would say where it belongs.
"""
from __future__ import annotations

from dataclasses import dataclass

from clone import Clone
from push_refusal import THE_COMMAND
from remote_branches import RemoteUnknown
from work_base import STAGING, Base, baseOfTheWork

THE_WORK = "HEAD"
RUN_ALL_THE_SAME = "The checks are run all the same."
GOES_INTO_STAGING = f"this repository has a {STAGING} branch, so this work's pull request goes into {STAGING}."
ONLY_THE_URGENT_FIX = "only the one urgent fix the person asked for by name goes into the default branch, and it says so"


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
        return Standing((f"this work holds {base.tracked} as it stands now.", *saidOfStaging(base)))
    if not shared:
        return Standing((notShownFor(base), *saidOfStaging(base)))
    return Standing(refusalFor(base), isBehindItsBase=True)


def saidOfStaging(base: Base) -> tuple[str, ...]:
    if base.isStaging:
        return (GOES_INTO_STAGING,)
    return ()


def notShownFor(base: Base) -> str:
    return f"this clone holds no history that joins this work to {base.tracked}, so nothing shows whether the work holds it. {RUN_ALL_THE_SAME}"


def refusalFor(base: Base) -> tuple[str, ...]:
    return (
        f"the checks were not run: this work does not hold what {base.tracked} holds now.",
        f"bring it in with `git merge {base.tracked}`, and run this again.",
        *saidOfStaging(base),
        howAnotherBaseIsNamed(base),
    )


def howAnotherBaseIsNamed(base: Base) -> str:
    if base.isStaging:
        return f"{ONLY_THE_URGENT_FIX}: `{THE_COMMAND} --base <default branch>`."
    return f"work that is to be merged into another branch names it: `{THE_COMMAND} --base <branch>`."
