"""A count the rules accept is settled: the entity leaves the out-of-range count and the plan alike, and moves no other."""
from __future__ import annotations

import unittest

from ..checks import design_patterns
from ..checks.entity_files import measure
from ..worklist.pattern_steps import patternSteps
from .fixtures import ENTITY_GLOBS, oneColumnEntity

FILES_OF_A_FULL_SLICE_PER_COMMAND = 19
JUDGED_ENTITY = "AccessRequestEntity"
REASON = "Three columns, and each of its commands is the full CQRS slice its siblings have."
UNJUDGED_RULES = {"entityGlobs": ENTITY_GLOBS}
JUDGED_RULES = {**UNJUDGED_RULES, "acceptedEntityCounts": {JUDGED_ENTITY: REASON}}


def entitiesWithOneOutOfRange() -> list:
    floorSized = oneColumnEntity("Quote", 2) + oneColumnEntity("Job", 2) + oneColumnEntity("Note", 2)
    return floorSized + oneColumnEntity("AccessRequest", FILES_OF_A_FULL_SLICE_PER_COMMAND)


def rowsByEntity(measured: dict) -> dict:
    return {row["entity"]: row for row in measured["rows"]}


def planTitles(patternRules: dict) -> list[str]:
    checked = design_patterns.check(entitiesWithOneOutOfRange(), {"designPatterns": patternRules})
    return [step["title"] for step in patternSteps([], checked)]


class AnAcceptedCountLeavesTheCount(unittest.TestCase):
    def test_an_entity_out_of_range_counts_until_a_round_accepts_it(self) -> None:
        measured = measure(entitiesWithOneOutOfRange(), UNJUDGED_RULES)
        self.assertEqual((measured["entitiesOutOfRange"], measured["entitiesAccepted"]), (1, 0))

    def test_an_accepted_entity_keeps_its_measured_row_marked_accepted(self) -> None:
        measured = measure(entitiesWithOneOutOfRange(), JUDGED_RULES)
        judged = rowsByEntity(measured)[JUDGED_ENTITY]
        self.assertEqual((judged["files"], judged["isInRange"], judged["isAccepted"]), (FILES_OF_A_FULL_SLICE_PER_COMMAND, False, True))
        self.assertEqual((measured["entitiesOutOfRange"], measured["entitiesAccepted"]), (0, 1))

    def test_accepting_one_entity_moves_no_other(self) -> None:
        unjudged = measure(entitiesWithOneOutOfRange(), UNJUDGED_RULES)
        judged = measure(entitiesWithOneOutOfRange(), JUDGED_RULES)
        self.assertEqual(judged["filesPerProperty"], unjudged["filesPerProperty"])
        self.assertEqual(
            [(row["expectedFiles"], row["isInRange"]) for row in judged["rows"]],
            [(row["expectedFiles"], row["isInRange"]) for row in unjudged["rows"]],
        )

    def test_the_summary_carries_how_many_were_accepted(self) -> None:
        checked = design_patterns.check(entitiesWithOneOutOfRange(), {"designPatterns": JUDGED_RULES})
        self.assertEqual((checked["summary"]["entitiesOutOfRange"], checked["summary"]["entitiesAccepted"]), (0, 1))


class ThePlanAgreesWithTheCount(unittest.TestCase):
    def test_the_plan_asks_for_an_entity_nobody_has_judged(self) -> None:
        self.assertEqual(planTitles(UNJUDGED_RULES), [f"Bring `{JUDGED_ENTITY}` into range"])

    def test_the_plan_never_asks_for_an_accepted_entity(self) -> None:
        self.assertEqual(planTitles(JUDGED_RULES), [])

    def test_the_step_says_where_a_judgement_is_recorded(self) -> None:
        checked = design_patterns.check(entitiesWithOneOutOfRange(), {"designPatterns": UNJUDGED_RULES})
        self.assertIn("acceptedEntityCounts", patternSteps([], checked)[0]["detail"])
