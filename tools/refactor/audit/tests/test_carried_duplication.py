"""A reading that cannot measure duplication keeps the figure the baseline measured, with the reason beside it."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from .. import carried_duplication
from ..carried_duplication import CARRIED_FROM_BASELINE, NOTHING_TO_CARRY
from ..check_names import CheckName
from ..check_result import SKIPPED, checkResult
from ..checks import duplication

REPOSITORY = Path("repository")
RULES: dict = {}
FIGURES = {"clones": 3, "duplicatedLines": 40, "totalLines": 2000, "duplicatedPercentage": 2.0}
HOTSPOTS = [{"file": "a.py", "duplicatedLineInstances": 40}]
MEASURED_BEFORE = checkResult(CheckName.duplication, FIGURES, HOTSPOTS)
MEASURED_NOW = checkResult(CheckName.duplication, {**FIGURES, "duplicatedPercentage": 1.5}, [])
REGISTRY_REFUSED = "npx --yes jscpd@5.4.3 wrote no report (exit 1: npm error code ECONNREFUSED)"
NOT_MEASURED_NOW = checkResult(CheckName.duplication, {SKIPPED: REGISTRY_REFUSED}, [])
NEVER_MEASURED = checkResult(CheckName.duplication, {SKIPPED: "jscpd is not installed (npm install -g jscpd)"}, [])
CARRIED_BEFORE = {**MEASURED_BEFORE, "summary": {**FIGURES, CARRIED_FROM_BASELINE: True, SKIPPED: "an earlier reason"}}


class ReadingsAgainstABaseline(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.baselinePath = Path(folder.name) / "baseline.json"

    def baselineHolds(self, baselineDuplication: dict) -> None:
        baseline = {"details": {CheckName.duplication: baselineDuplication}}
        self.baselinePath.write_text(json.dumps(baseline), encoding="utf-8")

    def fullReadingWhenJscpdAnswers(self, measurement: dict) -> dict:
        with patch.object(duplication, "check", return_value=measurement):
            return carried_duplication.reading(REPOSITORY, RULES, self.baselinePath, isFast=False)

    def fastReading(self) -> dict:
        measuring = Mock()
        with patch.object(duplication, "check", measuring):
            reading = carried_duplication.reading(REPOSITORY, RULES, self.baselinePath, isFast=True)
        measuring.assert_not_called()
        return reading


class AFullReading(ReadingsAgainstABaseline):
    def test_what_jscpd_measured_is_the_reading(self):
        self.baselineHolds(MEASURED_BEFORE)
        self.assertEqual(self.fullReadingWhenJscpdAnswers(MEASURED_NOW), MEASURED_NOW)

    def test_unmeasured_it_keeps_the_baselines_figures_and_hotspots_with_the_reason(self):
        self.baselineHolds(MEASURED_BEFORE)
        reading = self.fullReadingWhenJscpdAnswers(NOT_MEASURED_NOW)
        self.assertEqual(reading["summary"], {**FIGURES, CARRIED_FROM_BASELINE: True, SKIPPED: REGISTRY_REFUSED})
        self.assertEqual(reading["offenders"], HOTSPOTS)

    def test_a_figure_carried_before_is_carried_again_with_todays_reason(self):
        self.baselineHolds(CARRIED_BEFORE)
        reading = self.fullReadingWhenJscpdAnswers(NOT_MEASURED_NOW)
        self.assertEqual(reading["summary"], {**FIGURES, CARRIED_FROM_BASELINE: True, SKIPPED: REGISTRY_REFUSED})

    def test_a_baseline_that_never_measured_leaves_only_the_reason(self):
        self.baselineHolds(NEVER_MEASURED)
        self.assertEqual(self.fullReadingWhenJscpdAnswers(NOT_MEASURED_NOW), NOT_MEASURED_NOW)

    def test_with_no_baseline_there_is_only_the_reason(self):
        self.assertEqual(self.fullReadingWhenJscpdAnswers(NOT_MEASURED_NOW), NOT_MEASURED_NOW)


class AFastReading(ReadingsAgainstABaseline):
    def test_it_carries_the_baselines_figures_without_running_jscpd(self):
        self.baselineHolds(MEASURED_BEFORE)
        reading = self.fastReading()
        self.assertEqual(reading["summary"], {**FIGURES, CARRIED_FROM_BASELINE: True})
        self.assertEqual(reading["offenders"], HOTSPOTS)

    def test_it_keeps_the_reason_a_carried_baseline_gives(self):
        self.baselineHolds(CARRIED_BEFORE)
        self.assertEqual(self.fastReading()["summary"][SKIPPED], "an earlier reason")

    def test_with_no_baseline_it_says_there_was_nothing_to_carry(self):
        self.assertEqual(self.fastReading()["summary"], {SKIPPED: NOTHING_TO_CARRY})
