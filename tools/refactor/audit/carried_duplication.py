"""Keeps the baseline's duplication figure in a reading that does not measure it, and says when one was not measured.

A fast reading carries the figure by design. A full reading carries it only when jscpd could not measure, so a
figure that was once measured is never replaced by a reason: the reason is kept beside the carried figure.
"""
from __future__ import annotations

import json
from pathlib import Path

from .check_names import CheckName
from .check_result import SKIPPED, checkResult
from .checks import duplication
from .figures import DUPLICATED_PERCENTAGE

CARRIED_FROM_BASELINE = "carriedFromBaseline"
NOTHING_TO_CARRY = "--fast reading with no baseline to carry from"
CARRIED_FORWARD = "so the baseline's figure was carried forward"
NOT_HELD = "so the gate does not hold it until a reading measures it"


def baselineDuplication(baselinePath: Path) -> dict | None:
    if not baselinePath.exists():
        return None
    details = json.loads(baselinePath.read_text()).get("details", {})
    return details.get(CheckName.duplication)


def holdsFigure(summary: dict) -> bool:
    figureName = DUPLICATED_PERCENTAGE[1]
    return isinstance(summary.get(figureName), (int, float))


def carried(baseline: dict, whyNotMeasured: dict) -> dict:
    return {**baseline, "summary": {**baseline["summary"], CARRIED_FROM_BASELINE: True, **whyNotMeasured}}


def fastReading(baselinePath: Path) -> dict:
    baseline = baselineDuplication(baselinePath)
    if baseline is None:
        return checkResult(CheckName.duplication, {SKIPPED: NOTHING_TO_CARRY}, [])
    return carried(baseline, {})


def fullReading(repositoryRoot: Path, rules: dict, baselinePath: Path) -> dict:
    measurement = duplication.check(repositoryRoot, rules)
    baseline = baselineDuplication(baselinePath)
    isMeasured = SKIPPED not in measurement["summary"]
    if isMeasured or baseline is None or not holdsFigure(baseline["summary"]):
        return measurement
    return carried(baseline, {SKIPPED: measurement["summary"][SKIPPED]})


def reading(repositoryRoot: Path, rules: dict, baselinePath: Path, isFast: bool) -> dict:
    if isFast:
        return fastReading(baselinePath)
    return fullReading(repositoryRoot, rules, baselinePath)


def unmeasuredNotice(summary: dict) -> str | None:
    if SKIPPED not in summary:
        return None
    consequence = CARRIED_FORWARD if holdsFigure(summary) else NOT_HELD
    return f"Duplication was not measured, {consequence}: {summary[SKIPPED]}."
