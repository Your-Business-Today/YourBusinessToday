"""Measures duplication with jscpd, which it finds or fetches for itself, and says why when it measured nothing."""
from __future__ import annotations

import json
import subprocess
import tempfile
from collections import Counter
from pathlib import Path

from ..check_names import CheckName
from ..check_result import SKIPPED, checkResult
from .jscpd_command import CANNOT_BE_HAD, jscpdCommand

REPORT_FILE = "jscpd-report.json"
HOTSPOTS = "hotspots"
SAID_NOTHING = "it said nothing"
SHOWN_AS_ESCAPES = "backslashreplace"


def jscpdOptions(rules: dict, reportDirectory: Path) -> list[str]:
    duplicationRules = rules["duplication"]
    return [
        "--pattern", "{" + ",".join(rules["sourceGlobs"]) + "}",
        "--ignore", ",".join(duplicationRules["ignoreGlobs"]),
        "--min-tokens", str(duplicationRules["minTokens"]),
        "--reporters", "json",
        "--output", str(reportDirectory),
        "--silent",
    ]


def summariseReport(reportPath: Path, repositoryRoot: Path) -> dict:
    report = json.loads(reportPath.read_text())
    total = report["statistics"]["total"]
    hotspots: Counter[str] = Counter()
    for duplicate in report["duplicates"]:
        for side in ("firstFile", "secondFile"):
            relative = Path(duplicate[side]["name"]).as_posix().replace(
                repositoryRoot.as_posix() + "/", ""
            )
            hotspots[relative] += duplicate["lines"]
    return {
        "clones": total["clones"],
        "duplicatedLines": total["duplicatedLines"],
        "totalLines": total["lines"],
        "duplicatedPercentage": round(total["percentage"], 2),
        HOTSPOTS: [
            {"file": file, "duplicatedLineInstances": count}
            for file, count in hotspots.most_common(15)
        ],
    }


def measured(reportPath: Path, repositoryRoot: Path) -> dict:
    summary = summariseReport(reportPath, repositoryRoot)
    figures = {key: value for key, value in summary.items() if key != HOTSPOTS}
    return checkResult(CheckName.duplication, figures, summary[HOTSPOTS])


def notMeasured(why: str) -> dict:
    return checkResult(CheckName.duplication, {SKIPPED: why}, [])


def firstLineSaid(completed: subprocess.CompletedProcess) -> str:
    everythingSaid = (completed.stderr + completed.stdout).splitlines()
    spokenLines = (line.strip() for line in everythingSaid if line.strip())
    return next(spokenLines, SAID_NOTHING)


def whyNoReport(command: list[str], completed: subprocess.CompletedProcess) -> str:
    asRun = " ".join([Path(command[0]).name, *command[1:]])
    return f"{asRun} wrote no report (exit {completed.returncode}: {firstLineSaid(completed)})"


def check(repositoryRoot: Path, rules: dict) -> dict:
    command = jscpdCommand()
    if command is None:
        return notMeasured(CANNOT_BE_HAD)
    with tempfile.TemporaryDirectory() as reportDirectory:
        reportPath = Path(reportDirectory) / REPORT_FILE
        completed = subprocess.run(
            [*command, *jscpdOptions(rules, reportPath.parent)],
            cwd=repositoryRoot, capture_output=True, encoding="utf-8", errors=SHOWN_AS_ESCAPES,
        )
        if not reportPath.exists():
            return notMeasured(whyNoReport(command, completed))
        return measured(reportPath, repositoryRoot)
