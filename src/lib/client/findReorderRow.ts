import type { DropPlacement } from '$lib/client/listReorder.svelte';
import { reorderGroupOf, reorderListOf, reorderRowOf } from './reorderRowAttributes';

export type ReorderDropTarget = { rowId: string; placement: DropPlacement };

/**
 * Hit-test the pointer against the rows of one reorder list. Rows nest, so
 * the search walks from the innermost row under the pointer outward. Rows
 * inside the dragged row's own subtree are never targets. A row from the
 * dragged row's own sibling group is preferred; lists that allow nesting also
 * accept a row from any other group, which is how a drag leaves its parent.
 */
export function findReorderRow(
	listId: string,
	draggedRowId: string,
	draggedGroupId: string | null,
	clientX: number,
	clientY: number,
	canNestRows: boolean
): ReorderDropTarget | null {
	const rowsUnderPointer = rowsFromInnermostOutward(listId, clientX, clientY);
	const candidateRows = rowsOutsideDraggedSubtree(rowsUnderPointer, draggedRowId);
	const targetRow = preferredTargetRow(candidateRows, draggedGroupId, canNestRows);
	if (targetRow === null) return null;
	return dropTargetFor(targetRow, clientY, canNestRows);
}

function rowsFromInnermostOutward(
	listId: string,
	clientX: number,
	clientY: number
): HTMLElement[] {
	const rows: HTMLElement[] = [];
	const pointedElement = document.elementFromPoint(clientX, clientY);
	let row = pointedElement?.closest('[data-reorder-list]') ?? null;
	while (row instanceof HTMLElement) {
		if (reorderListOf(row) === listId) rows.push(row);
		row = row.parentElement?.closest('[data-reorder-list]') ?? null;
	}
	return rows;
}

function rowsOutsideDraggedSubtree(rows: HTMLElement[], draggedRowId: string): HTMLElement[] {
	const draggedRowIndex = rows.findIndex((row) => reorderRowOf(row) === draggedRowId);
	if (draggedRowIndex === -1) return rows;
	return rows.slice(draggedRowIndex + 1);
}

function preferredTargetRow(
	rows: HTMLElement[],
	draggedGroupId: string | null,
	canNestRows: boolean
): HTMLElement | null {
	const sameGroupRow = rows.find((row) => reorderGroupOf(row) === (draggedGroupId ?? ''));
	if (sameGroupRow !== undefined) return sameGroupRow;
	if (!canNestRows) return null;
	return rows[0] ?? null;
}

function dropTargetFor(row: HTMLElement, clientY: number, canNestRows: boolean): ReorderDropTarget {
	const rowId = reorderRowOf(row) ?? '';
	const rowBounds = row.getBoundingClientRect();
	if (!canNestRows) return { rowId, placement: placementByHalves(rowBounds, clientY) };
	return { rowId, placement: placementByThirds(rowBounds, clientY) };
}

function placementByHalves(rowBounds: DOMRect, clientY: number): DropPlacement {
	const isInTopHalf = clientY < rowBounds.top + rowBounds.height / 2;
	return isInTopHalf ? 'before' : 'after';
}

function placementByThirds(rowBounds: DOMRect, clientY: number): DropPlacement {
	const edgeBandHeight = rowBounds.height / 3;
	if (clientY < rowBounds.top + edgeBandHeight) return 'before';
	if (clientY > rowBounds.bottom - edgeBandHeight) return 'after';
	return 'inside';
}
