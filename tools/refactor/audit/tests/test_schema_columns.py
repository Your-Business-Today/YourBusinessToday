"""A column widened by a later migration reads at its new length, in SQL and in EF Core, and an alteration that names no type leaves it."""
from __future__ import annotations

import unittest

from ..inputs.schema_columns import tablesIn

CLIENT_TABLE = 'create table clients (id uuid primary key, name varchar(120), email varchar(256));'
WIDENED_IN_POSTGRES = 'alter table clients alter column name type varchar(500);'
WIDENED_IN_SQL_SERVER = 'ALTER TABLE [Clients] ALTER COLUMN [Email] nvarchar(500) NOT NULL;'
MADE_REQUIRED = 'alter table clients alter column name set not null;'
WIDENED_TO_TEXT = 'alter table clients alter column name set data type text;'
WIDENED_IN_EF = '''
migrationBuilder.AlterColumn<string>(
    name: "Email",
    table: "Clients",
    type: "nvarchar(500)",
    maxLength: 500,
    nullable: false,
    oldClrType: typeof(string),
    oldType: "nvarchar(256)",
    oldMaxLength: 256);
'''
ORIGINAL_NAME_LIMIT = 120
WIDENED_NAME_LIMIT = 500
WIDENED_EMAIL_LIMIT = 500


def clientColumns(*statements: str) -> dict:
    return tablesIn("\n".join(statements))["client"]


class SchemaColumnsTest(unittest.TestCase):
    def test_a_column_widened_by_alter_column_reads_at_its_new_length(self) -> None:
        self.assertEqual(clientColumns(CLIENT_TABLE, WIDENED_IN_POSTGRES)["name"], WIDENED_NAME_LIMIT)

    def test_sql_servers_alter_column_names_the_type_without_a_keyword(self) -> None:
        self.assertEqual(clientColumns(CLIENT_TABLE, WIDENED_IN_SQL_SERVER)["email"], WIDENED_EMAIL_LIMIT)

    def test_an_alteration_that_names_no_type_keeps_the_length(self) -> None:
        self.assertEqual(clientColumns(CLIENT_TABLE, MADE_REQUIRED)["name"], ORIGINAL_NAME_LIMIT)

    def test_a_column_widened_to_text_has_no_limit(self) -> None:
        self.assertIsNone(clientColumns(CLIENT_TABLE, WIDENED_TO_TEXT)["name"])

    def test_an_ef_alter_column_reads_the_new_length_not_the_old(self) -> None:
        self.assertEqual(clientColumns(WIDENED_IN_EF)["email"], WIDENED_EMAIL_LIMIT)
