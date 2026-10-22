"""An entity counts the columns it inherits, an abstract base is no entity, and its files are counted without the Entity suffix."""
from __future__ import annotations

import unittest

from ..checks.entity_files import entityProperties, fileCounts
from .fixtures import sourceFile

STAMPED_BASE = """
public abstract class StampedRecordColumns
{
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
"""
STAMPED_ENTITY = """
public sealed class InvoiceEntity : StampedRecordColumns, IStampedRecord
{
    public string Reference { get; set; } = "";
    public decimal Total { get; set; }
}
"""
ENTITY_GLOBS = ["api/Data/Entities/*.cs"]
OWN_AND_INHERITED_COLUMNS = 4


class EntityPropertiesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.files = [
            sourceFile("api/Data/Entities/StampedRecordColumns.cs", STAMPED_BASE),
            sourceFile("api/Data/Entities/InvoiceEntity.cs", STAMPED_ENTITY),
        ]

    def test_an_entity_counts_the_columns_it_inherits(self) -> None:
        self.assertEqual(entityProperties(self.files, ENTITY_GLOBS)["InvoiceEntity"], OWN_AND_INHERITED_COLUMNS)

    def test_an_abstract_base_is_not_an_entity(self) -> None:
        self.assertNotIn("StampedRecordColumns", entityProperties(self.files, ENTITY_GLOBS))



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
