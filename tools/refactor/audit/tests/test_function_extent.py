"""A function is measured from its signature to where it really ends, and a type's declaration is never a function."""
from __future__ import annotations

import unittest

from ..declarations import declaredFunctions
from .fixtures import sourceFile

POSITIONAL_RECORD = """
public sealed record Invoice(
    string Reference,
    decimal Total,
    string Status);

public static class Invoices
{
    public static void Raise(Invoice invoice)
    {
        ledger.Post(invoice);
    }
}
"""
RECORD_WITH_BODY = """
public sealed record Apple(
    string Colour,
    decimal Weight)
{
    public bool IsRed => Colour == Colours.Red;

    public Apple Ripened()
    {
        return this with { Colour = Colours.Red };
    }
}
"""
EXPRESSION_BODIES = """
public sealed class NullClient : IClient
{
    public Task<Page> ListAsync(string cursor, CancellationToken ct) =>
        Task.FromResult(Page.Empty);
    public Task<Page> SearchAsync(string query, CancellationToken ct) =>
        Task.FromResult(Page.Empty);
    public Task<Model> ToModelAsync(Row row) => Task.FromResult(new Model
    {
        Id = row.Id,
    });
}
"""
LONG_BODY = "\n".join(["public sealed class Ledger", "{", "    public void Post(Invoice invoice)", "    {"]
                      + [f"        lines.Add({index});" for index in range(40)] + ["    }", "}"])


class FunctionsEndWhereTheyEnd(unittest.TestCase):
    def test_a_positional_record_is_not_a_function(self):
        functions = declaredFunctions(sourceFile("Invoice.cs", POSITIONAL_RECORD))
        self.assertEqual([(function.name, function.lines) for function in functions], [("Raise", 4)])

    def test_a_record_body_holds_its_own_functions(self):
        functions = declaredFunctions(sourceFile("Apple.cs", RECORD_WITH_BODY))
        self.assertEqual([(function.name, function.lines) for function in functions], [("Ripened", 4)])

    def test_an_expression_body_ends_at_its_semicolon(self):
        functions = declaredFunctions(sourceFile("NullClient.cs", EXPRESSION_BODIES))
        lengths = [(function.name, function.lines) for function in functions]
        self.assertEqual(lengths, [("ListAsync", 2), ("SearchAsync", 2), ("ToModelAsync", 4)])

    def test_a_long_body_is_still_long(self):
        functions = declaredFunctions(sourceFile("Ledger.cs", LONG_BODY))
        self.assertEqual([(function.name, function.lines) for function in functions], [("Post", 43)])
