import type { RowTarget } from "$lib/client/rowLink";

export type RecordsColumn<Row> = {
  key: string;
  label: string;
  isFigure?: boolean;
  isWideOnly?: boolean;
  sortValue?: (row: Row) => string | number;
};

export const sortDirections = {
  ascending: "ascending",
  descending: "descending",
} as const;

export type SortDirection = (typeof sortDirections)[keyof typeof sortDirections];

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
    current?.key === key && current.direction === sortDirections.ascending;
  const direction = isSameColumnAscending
    ? sortDirections.descending
    : sortDirections.ascending;
  return { key, direction };
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

/** Where a row opens: its record's address when the table gives one, else what opens it over the list, else nowhere. */
export function rowTargetOf<Row>(
  row: Row,
  hrefOf?: (row: Row) => string,
  onOpen?: (row: Row) => void,
): RowTarget | undefined {
  if (hrefOf !== undefined) return hrefOf(row);
  if (onOpen !== undefined) return () => onOpen(row);
  return undefined;
}
