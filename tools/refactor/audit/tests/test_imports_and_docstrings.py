"""A Python import names a module and a docstring is prose: neither is a walk into an object."""
from __future__ import annotations

import unittest

from ..checks import prose
from .fixtures import sourceFile

RULES = {"prose": {"maxLineLength": 200, "maxIndentDepth": 9, "indentWidth": 4, "maxMemberChainDepth": 1}}


def longChainLinesIn(text: str) -> list[int]:
    result = prose.check([sourceFile("plan.py", text)], RULES)
    return [offender["line"] for offender in result["offenders"]["memberChains"]]


class ImportsAndDocstringsAreNotChains(unittest.TestCase):
    def test_a_relative_import(self):
        self.assertEqual(longChainLinesIn("from .worklist.render import renderPlan\n"), [])

    def test_an_absolute_import(self):
        self.assertEqual(longChainLinesIn("from tools.refactor.audit import plan\n"), [])

    def test_a_docstring_naming_a_module(self):
        text = '"""Builds the plan.\n\nUsage: python3 -m tools.refactor.audit.plan [repositoryRoot]\n"""\n'
        self.assertEqual(longChainLinesIn(text), [])

    def test_a_one_line_docstring(self):
        self.assertEqual(longChainLinesIn('    """Reads order.customer.address.postcode."""\n'), [])

    def test_code_after_a_docstring_is_still_read(self):
        text = '"""Usage: python3 -m tools.refactor.audit.plan\n"""\nname = order.customer.address.postcode\n'
        self.assertEqual(longChainLinesIn(text), [3])

    def test_code_before_a_text_block_opens_is_still_read(self):
        text = 'name = order.customer.address.postcode + """\nsome.text.here\n"""\n'
        self.assertEqual(longChainLinesIn(text), [1])
