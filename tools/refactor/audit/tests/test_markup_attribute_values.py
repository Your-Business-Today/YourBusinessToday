"""Markup attribute values are the markup's own vocabulary, so they are not repeated magic values."""
from __future__ import annotations

import unittest

from ..checks.magic_values import check
from .fixtures import sourceFile

RULES = {"styleTokens": {"markupGlobs": ["**/*.svelte"]}}
FORM_LINE = '<input type="hidden" name="taskId" autocomplete="off" class="rounded border px-2" />\n'
LINK_LINE = '<a rel="noreferrer" href="/tasks">Tasks</a><form method="post"></form>\n'
CODE_LINE = 'status = "awaiting payment";\n'


def repeatedLiterals(relative: str, text: str) -> list[str]:
    offenders = check([sourceFile(relative, text)], RULES)["offenders"]["repeatedLiterals"]
    return [offender["literal"] for offender in offenders]


def distinctLiterals(count: int) -> str:
    return "".join(f'const value{index} = "literal number {index}";\n' * 4 for index in range(count))


class MarkupAttributeValuesAreLeftOut(unittest.TestCase):
    def test_attribute_values_in_a_markup_file_are_not_counted(self):
        self.assertEqual(repeatedLiterals("src/routes/Task.svelte", (FORM_LINE + LINK_LINE) * 5), [])

    def test_a_string_in_code_in_a_markup_file_is_still_counted(self):
        self.assertEqual(repeatedLiterals("src/routes/Task.svelte", CODE_LINE * 4), ["awaiting payment"])

    def test_the_same_text_outside_markup_is_still_counted(self):
        self.assertEqual(repeatedLiterals("src/lib/task.ts", 'kind = "hidden";\n' * 4), ["hidden"])

    def test_every_repeated_literal_is_counted_not_the_top_thirty(self):
        summary = check([sourceFile("src/lib/values.ts", distinctLiterals(40))], RULES)["summary"]
        self.assertEqual(summary["repeatedStringLiterals"], 40)
