"""After the score a reading says when duplication was not measured: carried forward, or not held by the gate at all."""
from __future__ import annotations

import unittest

from ..carried_duplication import CARRIED_FROM_BASELINE, unmeasuredNotice
from ..check_result import SKIPPED

FIGURES = {"clones": 3, "duplicatedLines": 40, "totalLines": 2000, "duplicatedPercentage": 2.0}
WHY = "neither jscpd nor npx is on PATH, so jscpd can be neither run nor fetched"


class TheNoticeAfterAReading(unittest.TestCase):
    def test_a_measured_figure_needs_no_notice(self):
        self.assertIsNone(unmeasuredNotice(FIGURES))

    def test_a_fast_reading_of_a_measured_baseline_needs_none_either(self):
        self.assertIsNone(unmeasuredNotice({**FIGURES, CARRIED_FROM_BASELINE: True}))

    def test_a_figure_kept_because_nothing_could_measure_says_it_was_carried_forward(self):
        notice = unmeasuredNotice({**FIGURES, CARRIED_FROM_BASELINE: True, SKIPPED: WHY})
        self.assertEqual(notice, f"Duplication was not measured, so the baseline's figure was carried forward: {WHY}.")

    def test_no_figure_at_all_says_the_gate_does_not_hold_it(self):
        notice = unmeasuredNotice({SKIPPED: WHY})
        self.assertEqual(
            notice,
            f"Duplication was not measured, so the gate does not hold it until a reading measures it: {WHY}.",
        )
