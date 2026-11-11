import { describe, expect, it } from "vitest";
import {
  rowsInOrder,
  sortAfterPress,
  sortDirections,
  type RecordsColumn,
} from "./recordsTable";

type Invoice = { id: string; customer: string; total: number };

const invoices: Invoice[] = [
  { id: "a", customer: "Thames Joinery", total: 120 },
  { id: "b", customer: "Apex Roofing", total: 980 },
  { id: "c", customer: "Kingston Glass", total: 45 },
];

const customerKey = "customer";

const columns: RecordsColumn<Invoice>[] = [
  {
    key: customerKey,
    label: "Customer",
    sortValue: (invoice) => invoice.customer,
  },
  {
    key: "total",
    label: "Total",
    isFigure: true,
    sortValue: (invoice) => invoice.total,
  },
  { key: "status", label: "Status" },
];

function idsOf(rows: Invoice[]): string[] {
  return rows.map((row) => row.id);
}

describe("a records table in order", () => {
  it("keeps the rows as given until a column is pressed", () => {
    expect(idsOf(rowsInOrder(invoices, columns, null))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("sorts words alphabetically and figures by size", () => {
    const byCustomer = rowsInOrder(invoices, columns, {
      key: customerKey,
      direction: sortDirections.ascending,
    });
    const byTotalDescending = rowsInOrder(invoices, columns, {
      key: "total",
      direction: sortDirections.descending,
    });
    expect(idsOf(byCustomer)).toEqual(["b", "c", "a"]);
    expect(idsOf(byTotalDescending)).toEqual(["b", "a", "c"]);
  });

  it("leaves the rows alone for a column that does not sort", () => {
    expect(
      idsOf(
        rowsInOrder(invoices, columns, {
          key: "status",
          direction: sortDirections.ascending,
        }),
      ),
    ).toEqual(["a", "b", "c"]);
  });
});

describe("pressing a column header", () => {
  it("sorts upwards first, then turns the order round on a second press", () => {
    const firstPress = sortAfterPress(null, "total");
    const secondPress = sortAfterPress(firstPress, "total");
    expect(firstPress).toEqual({ key: "total", direction: sortDirections.ascending });
    expect(secondPress).toEqual({ key: "total", direction: sortDirections.descending });
  });

  it("starts upwards again on another column", () => {
    const pressed = sortAfterPress(
      { key: "total", direction: sortDirections.descending },
      customerKey,
    );
    expect(pressed).toEqual({ key: customerKey, direction: sortDirections.ascending });
  });
});
