"""The plan's sweep carries a step for every door that writes unchecked and every check looser than its column."""
from __future__ import annotations

import unittest

from ..score.element_keys import ElementKey
from ..worklist.sweep_steps import sweepSteps

DOORS = ElementKey.unvalidatedWrites


def element(key: str, score: float, offenders: int) -> dict:
    return {"key": key, "label": key, "score": score, "weight": 8, "offenders": offenders, "isMeasured": True}


def auditWith(elements: list[dict], inputValidation: dict) -> dict:
    return {"score": {"elements": elements}, "details": {"inputValidation": inputValidation}}


UNGUARDED = {"file": "src/routes/clients/+page.server.ts", "tables": ["client", "clientevent"]}
LOOSER = {"file": "src/lib/data/clientLimits.ts", "line": 7, "table": "client", "column": "name",
          "columnLimit": 120, "validatorLimit": 200}


class DoorStepsTest(unittest.TestCase):
    def test_each_unguarded_door_and_looser_limit_is_a_step(self) -> None:
        audit = auditWith([element(DOORS, 60.5, 2)], {"offenders": {"unvalidated": [UNGUARDED], "looserLimits": [LOOSER]}})
        titles = [step["title"] for step in sweepSteps(audit)]
        self.assertEqual(len(titles), 2)
        self.assertIn("line 7 back to its column", titles[0])
        self.assertIn("Close the door in `src/routes/clients/+page.server.ts`", titles[1])

    def test_doors_take_their_place_in_score_order(self) -> None:
        elements = [element(ElementKey.elseBlocks, 90.0, 3), element(DOORS, 60.5, 1)]
        audit = auditWith(elements, {"offenders": {"unvalidated": [UNGUARDED], "looserLimits": []}})
        titles = [step["title"] for step in sweepSteps(audit)]
        self.assertTrue(titles[0].startswith("Close the door"))
        self.assertTrue(titles[1].startswith(ElementKey.elseBlocks))

    def test_closed_doors_leave_no_step(self) -> None:
        audit = auditWith([element(DOORS, 100.0, 0)], {"offenders": {"unvalidated": [], "looserLimits": []}})
        self.assertEqual(sweepSteps(audit), [])
