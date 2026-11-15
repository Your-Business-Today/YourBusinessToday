"""The report's table of every ratcheted figure against the baseline, with a verdict only where the gate compares."""
from __future__ import annotations

import json
from pathlib import Path

from .gate import RATCHETED_FIGURES
from .score.breakdown import percentage
from .uncompared_figures import whyNotCompared

NO_BASELINE = "No `baseline.json` beside the audit — nothing to ratchet against."
NO_VERDICT = "—"
WORSE = "worse"
BETTER = "better"
HELD = "held"


def verdictOn(baselineSummary: dict, currentSummary: dict, figureName: str) -> str:
    if whyNotCompared(baselineSummary, currentSummary, figureName):
        return NO_VERDICT
    was, now = baselineSummary[figureName], currentSummary[figureName]
    if now > was:
        return WORSE
    return BETTER if now < was else HELD


def figureRow(baseline: dict, current: dict, checkName: str, figureName: str) -> str:
    baselineSummary, currentSummary = baseline.get(checkName, {}), current.get(checkName, {})
    was, now = baselineSummary.get(figureName), currentSummary.get(figureName)
    verdict = verdictOn(baselineSummary, currentSummary, figureName)
    return f"| {checkName}.{figureName} | {was} | {now} | {verdict} |"


def baselineTable(current: dict, score: dict, baselinePath: Path) -> str:
    if not baselinePath.exists():
        return NO_BASELINE
    baselineAudit = json.loads(baselinePath.read_text())
    baseline = baselineAudit["summaries"]
    scoreBefore = baselineAudit.get("score", {}).get("overall")
    rows = ["| Ratcheted figure | Baseline | Now | Verdict |", "| --- | --- | --- | --- |"]
    rows.append(f"| code quality score | {percentage(scoreBefore)} | {percentage(score['overall'])} | {NO_VERDICT} |")
    rows += [figureRow(baseline, current, checkName, figureName) for checkName, figureName in RATCHETED_FIGURES]
    return "\n".join(rows)
