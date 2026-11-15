"""Says why the gate could not compare a ratcheted figure: the reading did not measure it, or one side holds no figure."""
from __future__ import annotations

from .check_result import SKIPPED

NOT_MEASURED_NOW = "was not measured by this reading"
NO_FIGURE_NOW = "has no figure in this reading"
NO_FIGURE_IN_BASELINE = "has no figure in the baseline"


def withReason(statement: str, summary: dict) -> str:
    if SKIPPED not in summary:
        return statement
    return f"{statement}: {summary[SKIPPED]}"


def whyNotCompared(baselineSummary: dict, currentSummary: dict, figureName: str) -> str | None:
    if SKIPPED in currentSummary:
        return withReason(NOT_MEASURED_NOW, currentSummary)
    if currentSummary.get(figureName) is None:
        return NO_FIGURE_NOW
    if baselineSummary.get(figureName) is None:
        return withReason(NO_FIGURE_IN_BASELINE, baselineSummary)
    return None
