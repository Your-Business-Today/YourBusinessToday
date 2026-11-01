"""An entity's files are the ones named for its subject, and the band allows the patterns' floor of files."""
from __future__ import annotations

import unittest

from ..checks.entity_files import fileCounts, measure
from .fixtures import ENTITY_GLOBS, oneColumnEntity, sourceFile

QUOTE_ENTITY = """
public sealed class QuoteEntity
{
    public string Reference { get; set; } = "";
}
"""
QUOTE_FILES_INCLUDING_THE_ENTITY = 3


class EntityFileCountTests(unittest.TestCase):
    def test_files_named_for_the_subject_count_without_the_entity_suffix(self) -> None:
        files = [
            sourceFile("api/Data/Entities/QuoteEntity.cs", QUOTE_ENTITY),
            sourceFile("api/Features/Quotes/QuoteEdit.cs"),
            sourceFile("api/Features/Quotes/QuoteQueries.cs"),
        ]
        self.assertEqual(fileCounts(files, ["QuoteEntity"])["QuoteEntity"], QUOTE_FILES_INCLUDING_THE_ENTITY)

    def test_the_longest_subject_owns_a_file_named_for_two_entities(self) -> None:
        files = [sourceFile("api/Features/Quotes/QuoteRevisionEdit.cs")]
        counts = fileCounts(files, ["QuoteEntity", "QuoteRevisionEntity"])
        self.assertEqual(counts, {"QuoteEntity": 0, "QuoteRevisionEntity": 1})

    def test_a_file_belongs_to_the_subject_in_its_name_not_its_directory(self) -> None:
        files = [sourceFile("api/Features/Jobs/Groups/JobGroupLookup.cs"), sourceFile("api/Features/Documents/HandoverPackDocumentRow.cs")]
        counts = fileCounts(files, ["JobEntity", "JobGroupEntity", "DocumentEntity", "HandoverPackDocumentEntity"])
        self.assertEqual(counts, {"JobEntity": 0, "JobGroupEntity": 1, "DocumentEntity": 0, "HandoverPackDocumentEntity": 1})

    def test_a_directory_named_for_the_subject_owns_nothing_by_itself(self) -> None:
        files = [sourceFile("api/Features/Documents/BrandFonts.cs")]
        self.assertEqual(fileCounts(files, ["DocumentEntity"])["DocumentEntity"], 0)

    def test_a_command_file_names_the_subject_after_its_verb(self) -> None:
        files = [sourceFile("api/Features/Todos/Commands/AddTodoItemEndpoint.cs"), sourceFile("api/Features/Todos/Commands/LinkTodoItemsHandler.cs")]
        self.assertEqual(fileCounts(files, ["TodoItemEntity"])["TodoItemEntity"], len(files))


PATTERN_RULES = {"entityGlobs": ENTITY_GLOBS}
FLOOR_OF_PATTERN_FILES = 6


class EntityFileBandTests(unittest.TestCase):
    def test_an_entity_carrying_the_patterns_floor_of_files_is_in_range(self) -> None:
        files = oneColumnEntity("Quote", 2) + oneColumnEntity("Job", 2) + oneColumnEntity("Note", 2) + oneColumnEntity("AccessRequest", FLOOR_OF_PATTERN_FILES)
        rows = {row["entity"]: row for row in measure(files, PATTERN_RULES)["rows"]}
        self.assertTrue(rows["AccessRequestEntity"]["isInRange"])
