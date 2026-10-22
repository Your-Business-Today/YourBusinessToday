"""The last pass of the plan: every remaining figure brought to zero, the lowest-scoring element first."""
from __future__ import annotations

from ..score.element_keys import ElementKey
from ..score.elements import ELEMENTS
from .door_steps import doorSteps

SWEEP = "Pass 5 — The sweep to zero"
HANDLED_BY_EARLIER_PASSES = {
    ElementKey.filesOverLimit, ElementKey.worstFile, ElementKey.orphans,
    ElementKey.predictedFiles, ElementKey.entityFileCounts, ElementKey.handRolledWidgets,
}
DOORS_INTO_THE_DATA = ElementKey.unvalidatedWrites


def checkNameFor(elementKey: str) -> str:
    return next(row["figures"][0][0] for row in ELEMENTS if row["key"] == elementKey)


def elementStep(row: dict) -> dict:
    return {
        "pass": SWEEP,
        "title": f"{row['label']}: {row['offenders']:g} to zero",
        "detail": (
            f"Scores {row['score']:.1f}% at weight {row['weight']}; the offenders are in audit.json "
            f"under details.{checkNameFor(row['key'])}, fifty at a time."
        ),
    }


def stepsForElement(row: dict, audit: dict) -> list[dict]:
    if row["key"] == DOORS_INTO_THE_DATA:
        return doorSteps(SWEEP, audit["details"].get(checkNameFor(row["key"]), {}))
    return [elementStep(row)]


def sweepSteps(audit: dict) -> list[dict]:
    remaining = [
        row for row in audit["score"]["elements"]
        if row["isMeasured"] and row["offenders"] and row["key"] not in HANDLED_BY_EARLIER_PASSES
    ]
    remaining.sort(key=lambda row: row["score"])
    return [step for row in remaining for step in stepsForElement(row, audit)]
