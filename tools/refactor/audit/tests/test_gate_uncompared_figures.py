"""The gate names every ratcheted figure it could not compare, and a figure it could not compare never fails it."""
from __future__ import annotations

import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from .. import gate
from ..carried_duplication import CARRIED_FROM_BASELINE
from ..check_names import CheckName
from ..check_result import SKIPPED

DUPLICATION = f"{CheckName.duplication}.duplicatedPercentage"
REGISTRY_REFUSED = "npx --yes jscpd@5.4.3 wrote no report (exit 1: npm error code ECONNREFUSED)"
NOT_INSTALLED = "jscpd is not installed (npm install -g jscpd)"


def everyFigureAt(value: int, duplication: dict | None = None) -> dict:
    summaries: dict = {}
    for checkName, figureName in gate.RATCHETED_FIGURES:
        summaries.setdefault(checkName, {})[figureName] = value
    if duplication is not None:
        summaries[CheckName.duplication] = duplication
    return summaries


def gateSays(baseline: dict, current: dict) -> tuple[int, list[str]]:
    with tempfile.TemporaryDirectory() as folder:
        baselinePath, currentPath = Path(folder) / "baseline.json", Path(folder) / "audit.json"
        baselinePath.write_text(json.dumps({"summaries": baseline}), encoding="utf-8")
        currentPath.write_text(json.dumps({"summaries": current}), encoding="utf-8")
        said = io.StringIO()
        with patch.object(sys, "argv", ["gate", str(baselinePath), str(currentPath)]), contextlib.redirect_stdout(said):
            exitCode = gate.main()
    return exitCode, said.getvalue().splitlines()


class WhatTheGateCouldNotCompare(unittest.TestCase):
    def test_two_measured_readings_pass_with_nothing_more_to_say(self):
        self.assertEqual(gateSays(everyFigureAt(1), everyFigureAt(1)), (gate.HELD_EXIT, [gate.PASSED]))

    def test_a_figure_the_reading_did_not_measure_is_named_with_the_reason(self):
        carried = {"duplicatedPercentage": 1, CARRIED_FROM_BASELINE: True, SKIPPED: REGISTRY_REFUSED}
        unheld = gate.notCompared(everyFigureAt(1), everyFigureAt(1, carried))
        self.assertEqual(unheld, [f"{DUPLICATION} was not measured by this reading: {REGISTRY_REFUSED}"])

    def test_a_figure_the_baseline_does_not_hold_is_named_with_the_baselines_reason(self):
        unheld = gate.notCompared(everyFigureAt(1, {SKIPPED: NOT_INSTALLED}), everyFigureAt(1))
        self.assertEqual(unheld, [f"{DUPLICATION} has no figure in the baseline: {NOT_INSTALLED}"])

    def test_a_figure_missing_from_the_reading_is_named(self):
        unheld = gate.notCompared(everyFigureAt(1), everyFigureAt(1, {}))
        self.assertEqual(unheld, [f"{DUPLICATION} has no figure in this reading"])

    def test_a_fast_reading_of_a_measured_baseline_is_compared_and_not_named(self):
        carriedByDesign = {"duplicatedPercentage": 1, CARRIED_FROM_BASELINE: True}
        self.assertEqual(gate.notCompared(everyFigureAt(1), everyFigureAt(1, carriedByDesign)), [])


class AFigureTheGateCouldNotCompare(unittest.TestCase):
    def test_it_never_fails_the_gate_and_is_listed_after_the_verdict(self):
        measuredHigher = everyFigureAt(1, {"duplicatedPercentage": 9})
        exitCode, said = gateSays(everyFigureAt(1, {SKIPPED: NOT_INSTALLED}), measuredHigher)
        self.assertEqual(exitCode, gate.HELD_EXIT)
        self.assertEqual(
            said,
            [gate.PASSED, gate.NOT_COMPARED, f"  {DUPLICATION} has no figure in the baseline: {NOT_INSTALLED}"],
        )

    def test_a_measured_figure_that_rose_still_fails_it(self):
        exitCode, said = gateSays(everyFigureAt(1), everyFigureAt(1, {"duplicatedPercentage": 9}))
        self.assertEqual(exitCode, gate.REGRESSED_EXIT)
        self.assertEqual(said, [gate.FAILED, f"  {DUPLICATION} regressed: 1 -> 9"])

    def test_a_failing_gate_names_what_it_could_not_compare_as_well(self):
        answer = gate.answer(["fileLength.filesOverLimit regressed: 1 -> 2"], [f"{DUPLICATION} has no figure in this reading"])
        self.assertEqual(
            answer,
            [gate.FAILED, "  fileLength.filesOverLimit regressed: 1 -> 2", gate.NOT_COMPARED, f"  {DUPLICATION} has no figure in this reading"],
        )
