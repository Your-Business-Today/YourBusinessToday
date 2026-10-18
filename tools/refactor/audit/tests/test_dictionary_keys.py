"""A dictionary key is the name of a field, as a property name is, so it is not a repeated magic value."""
from __future__ import annotations

import unittest

from ..checks import magic_values
from .fixtures import sourceFile

RULES = {"styleTokens": {"markupGlobs": []}}


def repeatedLiteralsIn(line: str) -> list[str]:
    text = "\n".join([line] * magic_values.REPEATED_LITERAL_THRESHOLD)
    result = magic_values.check([sourceFile("report.py", text)], RULES)
    return [row["literal"] for row in result["offenders"]["repeatedLiterals"]]


class DictionaryKeysAreNotMagicValues(unittest.TestCase):
    def test_keys_read_by_subscript(self):
        self.assertEqual(repeatedLiteralsIn('lines = results["fileLength"]["summary"]'), [])

    def test_keys_read_by_get(self):
        self.assertEqual(repeatedLiteralsIn('offenders = results.get("fileLength", {}).get("offenders", [])'), [])

    def test_keys_written_in_a_literal(self):
        self.assertEqual(repeatedLiteralsIn('row = {"literal": literal, "occurrences": count}'), [])

    def test_a_value_is_still_counted(self):
        self.assertEqual(repeatedLiteralsIn('status = results.get("status", "archived")'), ["archived"])

    def test_a_list_literal_is_still_counted(self):
        self.assertEqual(repeatedLiteralsIn('prefixes = ["archived"]'), ["archived"])

    def test_a_ternary_branch_is_still_counted(self):
        self.assertEqual(repeatedLiteralsIn('label = isPaid ? "settled" : "pending"'), ["settled", "pending"])
