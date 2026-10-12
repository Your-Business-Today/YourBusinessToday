"""Dots written inside a string are text, not member chains, whichever quote the string uses."""
from __future__ import annotations

import unittest

from ..checks.member_chains import isTooDeep
from ..checks.prose import stripStringsAndComments

PROSE_RULES = {"maxMemberChainDepth": 1}


def isLongChain(line: str) -> bool:
    return isTooDeep(stripStringsAndComments(line), PROSE_RULES)


class TextInsideStringsIsNotAChain(unittest.TestCase):
    def test_mime_types(self):
        self.assertFalse(isLongChain("const wordDocument = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';"))
        self.assertFalse(isLongChain("headers: { Accept: 'application/vnd.github.raw' },"))

    def test_a_zip_entry_path(self):
        self.assertFalse(isLongChain("const relationships = archive.file('word/_rels/document.xml.rels');"))

    def test_a_supabase_embedded_filter(self):
        self.assertFalse(isLongChain("query = query.eq('client_contacts.people.email', email);"))

    def test_prose_sentences(self):
        self.assertFalse(isLongChain("message: 'Report it to the regulator at ico.org.uk within three days.',"))
        self.assertFalse(isLongChain("summary: 'Written to tools/refactor/baseline.json. The report follows.',"))

    def test_template_and_double_quoted_strings(self):
        self.assertFalse(isLongChain("const path = `word/_rels/document.xml.rels`;"))
        self.assertFalse(isLongChain('const host = "ico.org.uk";'))

    def test_code_inside_a_template_interpolation_is_still_read(self):
        self.assertTrue(isLongChain("const label = `${invoice.project.client.name} owes`;"))

    def test_code_outside_the_string_is_still_read(self):
        self.assertTrue(isLongChain("const name = order.customer.address.postcode + 'x.y.z';"))
