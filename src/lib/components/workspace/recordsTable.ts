export type RecordsColumn<Row> = {
  key: string;
  label: string;
  isFigure?: boolean;
  isWideOnly?: boolean;
  sortValue?: (row: Row) => string | number;
};

export type SortDirection = "ascending" | "descending";

export type RecordsSort = { key: string; direction: SortDirection };

const directionSign: Record<SortDirection, number> = {
  ascending: 1,
  descending: -1,
};

export function sortAfterPress(
  current: RecordsSort | null,
  key: string,
): RecordsSort {
  const isSameColumnAscending =
    current?.key === key && current.direction === "ascending";
  return { key, direction: isSameColumnAscending ? "descending" : "ascending" };
}

export function rowsInOrder<Row>(
  rows: Row[],
  columns: RecordsColumn<Row>[],
  sort: RecordsSort | null,
): Row[] {
  const sortedColumn = columns.find((column) => column.key === sort?.key);
  const sortValue = sortedColumn?.sortValue;
  if (sort === null || sortValue === undefined) return rows;
  const sign = directionSign[sort.direction];
  return [...rows].sort(
    (first, second) =>
      sign * compareValues(sortValue(first), sortValue(second)),
  );
}

function compareValues(
  first: string | number,
  second: string | number,
): number {
  if (typeof first === "number" && typeof second === "number")
    return first - second;
  return String(first).localeCompare(String(second), "en-GB", {
    numeric: true,
  });
}

export function isBoxTicked(event: Event): boolean {
  const box = event.currentTarget as HTMLInputElement;
  return box.checked;
}
