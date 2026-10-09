"""A gap the rules accept is settled: it leaves the pattern's missing list and the plan alike."""
from __future__ import annotations

import unittest

from ..checks import design_patterns, pattern_roles
from ..worklist.steps import patternSteps
from .fixtures import sourceFile

SUBJECTS_WITH_HANDLERS = ["CreateProject", "ArchiveProject", "RenameProject", "DeleteProject", "ShareProject"]
SUBJECTS_WITH_VALIDATORS = ["CreateProject", "ArchiveProject", "RenameProject", "ShareProject"]
DELETE_VALIDATOR = "Commands/DeleteProjectValidator.cs"
EVERY_HANDLER_HAS_A_VALIDATOR = "every handler has a validator"


def commandFiles() -> list:
    handlers = [sourceFile(f"Commands/{subject}Handler.cs") for subject in SUBJECTS_WITH_HANDLERS]
    validators = [sourceFile(f"Commands/{subject}Validator.cs") for subject in SUBJECTS_WITH_VALIDATORS]
    return handlers + validators


def patternNamed(measured: dict, name: str) -> dict:
    return next(pattern for pattern in measured["patterns"] if pattern["pattern"] == name)


class AcceptedGapsLeaveThePattern(unittest.TestCase):
    def test_a_gap_nobody_accepted_is_missing(self):
        measured = pattern_roles.measure(commandFiles(), {})
        self.assertEqual(patternNamed(measured, EVERY_HANDLER_HAS_A_VALIDATOR)["missing"], [DELETE_VALIDATOR])
        self.assertEqual(measured["predictedFilesMissing"], 1)

    def test_an_accepted_gap_leaves_its_pattern_and_the_count(self):
        measured = pattern_roles.measure(commandFiles(), {"acceptedGaps": [DELETE_VALIDATOR]})
        self.assertEqual(patternNamed(measured, EVERY_HANDLER_HAS_A_VALIDATOR)["missing"], [])
        self.assertEqual(measured["predictedFilesMissing"], 0)

    def test_a_pattern_with_some_gaps_accepted_keeps_the_rest(self):
        files = commandFiles() + [sourceFile("Commands/CloseProjectHandler.cs")]
        rules = {"acceptedGaps": [DELETE_VALIDATOR], "cooccurrenceThreshold": 0.6}
        measured = pattern_roles.measure(files, rules)
        self.assertEqual(patternNamed(measured, EVERY_HANDLER_HAS_A_VALIDATOR)["missing"], ["Commands/CloseProjectValidator.cs"])


class ThePlanAgreesWithTheScore(unittest.TestCase):
    def test_no_step_asks_for_an_accepted_file(self):
        designPatterns = design_patterns.check(commandFiles(), {"designPatterns": {"acceptedGaps": [DELETE_VALIDATOR]}})
        self.assertEqual(designPatterns["summary"]["predictedFilesMissing"], 0)
        self.assertEqual(patternSteps([], designPatterns), [])

    def test_a_step_names_only_the_files_still_missing(self):
        designPatterns = design_patterns.check(commandFiles(), {"designPatterns": {}})
        steps = patternSteps([], designPatterns)
        self.assertEqual([step["title"] for step in steps], [f"Complete the pattern: {EVERY_HANDLER_HAS_A_VALIDATOR}"])
        self.assertIn(DELETE_VALIDATOR, steps[0]["detail"])

