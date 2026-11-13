import { describe, expect, it } from "vitest";
import { rowTargetOf } from "./recordsTable";

describe("rowTargetOf", () => {
  const row = { id: "harbour" };

  it("opens a row at its address when the table gives one", () => {
    expect(rowTargetOf(row, (shown) => `/projects/${shown.id}`)).toBe("/projects/harbour");
  });

  it("opens a row over the list when the table says how", () => {
    const opened: string[] = [];
    const target = rowTargetOf(row, undefined, (shown) => opened.push(shown.id));
    if (typeof target === "function") target();
    expect(opened).toEqual(["harbour"]);
  });

  it("leaves a row that opens nothing as it is", () => {
    expect(rowTargetOf(row)).toBeUndefined();
  });
});
