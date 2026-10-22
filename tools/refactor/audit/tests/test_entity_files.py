"""An entity's complexity counts the columns it inherits from an abstract base, and the base is never an entity of its own."""
from __future__ import annotations

import unittest

from ..checks.entity_files import entityProperties
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

