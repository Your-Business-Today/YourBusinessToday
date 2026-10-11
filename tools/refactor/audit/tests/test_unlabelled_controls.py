"""A rule with unlessUnlabelled counts a control as a FormField written by hand only when a label wraps or names it."""
from __future__ import annotations

import unittest

from ..site.definition_kinds import FINDING, flatten
from ..site.site_definition import definitionOf
from ..site.vocabulary import vocabularyFor
from .fixtures import sourceFile

LABELLED_FORM = """
<form>
  <label for="client-name">Client</label>
  <input id="client-name" type="text" />
  <label>Notes <textarea></textarea></label>
</form>
"""
SEARCH_AND_FILTER = """
<input type="search" placeholder="Search" />
<select id="status-filter"><option>All</option></select>
<table><tr><td><input value="3" /></td></tr></table>
"""


def handRolledElements(text: str, isUnlessUnlabelled: bool) -> list[str]:
    rules = [{"element": element, "ownedBy": "FormField", "unlessUnlabelled": isUnlessUnlabelled} for element in ("input", "select", "textarea")]
    settings = {"catalogue": ["FormField"], "handRolled": rules}
    view = sourceFile("Pages/Clients.razor", text)
    definitions = definitionOf(view, vocabularyFor(settings, [view]))
    return [definition.name for definition in flatten(definitions) if definition.kind == FINDING]


class UnlabelledControlsAreLeftOut(unittest.TestCase):
    def test_a_labelled_control_is_still_a_form_field_written_by_hand(self):
        self.assertEqual(handRolledElements(LABELLED_FORM, True), ["input", "textarea"])

    def test_search_boxes_filters_and_cell_editors_are_left_out(self):
        self.assertEqual(handRolledElements(SEARCH_AND_FILTER, True), [])

    def test_without_the_option_every_control_counts(self):
        self.assertEqual(handRolledElements(SEARCH_AND_FILTER, False), ["input", "select", "input"])
