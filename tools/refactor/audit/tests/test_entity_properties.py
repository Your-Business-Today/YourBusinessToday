"""An entity counts the columns it inherits, counts a column whatever sits before it, and an abstract base is no entity."""
from __future__ import annotations

import unittest

from ..checks.entity_properties import entityProperties
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
ATTRIBUTED_ENTITY = """
public sealed class AccessRequestEntity
{
    [Key, MaxLength(256)] public string Email { get; set; } = "";
    [Column(TypeName = "decimal(18,2)")]
    public decimal Deposit { get; set; }
    [Required]
    [MaxLength(64)] public string Status { get; set; } = "";
}
"""
ENTITY_GLOBS = ["api/Data/Entities/*.cs"]
OWN_AND_INHERITED_COLUMNS = 4
ATTRIBUTED_COLUMNS = 3


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

    def test_a_property_counts_whether_its_attributes_sit_above_it_or_before_it(self) -> None:
        files = [sourceFile("api/Data/Entities/AccessRequestEntity.cs", ATTRIBUTED_ENTITY)]
        self.assertEqual(entityProperties(files, ENTITY_GLOBS)["AccessRequestEntity"], ATTRIBUTED_COLUMNS)
