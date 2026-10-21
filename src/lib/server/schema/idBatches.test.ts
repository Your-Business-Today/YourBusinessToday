import { describe, expect, it } from "vitest";
import { idBatches, idsPerRequest } from "./idBatches";

describe("idBatches", () => {
  it("keeps every id, in order, in lists no longer than one request carries", () => {
    const ids = Array.from(
      { length: idsPerRequest * 4 + 5 },
      (_, index) => `task-${index}`,
    );
    const batches = idBatches(ids);
    expect(batches.flat()).toEqual(ids);
    expect(batches.every((batch) => batch.length <= idsPerRequest)).toBe(true);
  });

  it("makes no request for no ids", () => {
    expect(idBatches([])).toEqual([]);
  });
});
