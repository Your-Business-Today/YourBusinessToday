"""The report's table against the baseline gives a verdict only on a figure the gate compares."""
from __future__ import annotations

import unittest

from ..baseline_table import BETTER, HELD, NO_VERDICT, WORSE, verdictOn
from ..carried_duplication import CARRIED_FROM_BASELINE
from ..check_result import SKIPPED

PERCENTAGE = "duplicatedPercentage"
MEASURED_BEFORE = {PERCENTAGE: 2.0}
WHY = "neither jscpd nor npx is on PATH, so jscpd can be neither run nor fetched"


def verdictWhenNow(currentSummary: dict) -> str:
    return verdictOn(MEASURED_BEFORE, currentSummary, PERCENTAGE)


class AFigureBothReadingsMeasured(unittest.TestCase):
    def test_one_that_fell_is_better(self):
        self.assertEqual(verdictWhenNow({PERCENTAGE: 1.5}), BETTER)

    def test_one_that_rose_is_worse(self):
        self.assertEqual(verdictWhenNow({PERCENTAGE: 2.5}), WORSE)

    def test_one_that_stayed_is_held(self):
        self.assertEqual(verdictWhenNow({PERCENTAGE: 2.0}), HELD)

    def test_a_fast_reading_of_a_measured_baseline_is_held(self):
        self.assertEqual(verdictWhenNow({PERCENTAGE: 2.0, CARRIED_FROM_BASELINE: True}), HELD)


class AFigureTheGateCouldNotCompare(unittest.TestCase):
    def test_one_carried_because_nothing_could_measure_is_given_no_verdict(self):
        carried = {PERCENTAGE: 2.0, CARRIED_FROM_BASELINE: True, SKIPPED: WHY}
        self.assertEqual(verdictWhenNow(carried), NO_VERDICT)

    def test_one_missing_from_the_reading_is_given_no_verdict(self):
        self.assertEqual(verdictWhenNow({SKIPPED: WHY}), NO_VERDICT)

    def test_one_the_baseline_does_not_hold_is_given_no_verdict(self):
        self.assertEqual(verdictOn({SKIPPED: WHY}, {PERCENTAGE: 2.0}, PERCENTAGE), NO_VERDICT)
