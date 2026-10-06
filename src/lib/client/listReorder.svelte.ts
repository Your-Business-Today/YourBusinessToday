import { EdgeAutoScroller } from '$lib/client/edgeAutoScroller';
import { findReorderRow } from '$lib/client/findReorderRow';

export type DropPlacement = 'before' | 'after' | 'inside';

export const dropPlacements = { before: 'before', after: 'after', inside: 'inside' } as const;

export type SubmitListReorder = (
	movedId: string,
	targetId: string,
	placement: DropPlacement
) => Promise<void>;

export type ListReorderOptions = { canNestRows?: boolean };

let nextListNumber = 0;

/**
 * Drag-to-reorder state for one list, driven by pointer events so it works
 * with both mouse and touch. Rows carry a sibling-group key (for nested
 * lists); a drag prefers dropping among the rows it started beside. Lists
 * that allow nesting also accept a drop on a row's middle band (which files
 * the dragged row as that row's child) and a drop beside a row in another
 * group (which moves the dragged row to that group's level).
 */
export class ListReorder {
	draggedId = $state<string | null>(null);
	draggedGroupId = $state<string | null>(null);
	dropTargetId = $state<string | null>(null);
	dropPlacement = $state<DropPlacement>('before');
	readonly listId: string;
	readonly canNestRows: boolean;
	readonly submitReorder: SubmitListReorder;
	#autoScroller = new EdgeAutoScroller();

	constructor(submitReorder: SubmitListReorder, options: ListReorderOptions = {}) {
		this.submitReorder = submitReorder;
		this.canNestRows = options.canNestRows ?? false;
		nextListNumber += 1;
		this.listId = `reorder-${nextListNumber}`;
	}

	beginDrag(rowId: string, groupId: string | null): void {
		this.draggedId = rowId;
		this.draggedGroupId = groupId;
	}

	trackDrag(event: PointerEvent): void {
		const { draggedId, draggedGroupId } = this;
		if (draggedId === null) return;
		this.#autoScroller.follow(event.clientY);
		const dropTarget = findReorderRow(
			this.listId,
			draggedId,
			draggedGroupId,
			event.clientX,
			event.clientY,
			this.canNestRows
		);
		if (dropTarget === null || dropTarget.rowId === draggedId) {
			this.dropTargetId = null;
			return;
		}
		this.dropTargetId = dropTarget.rowId;
		this.dropPlacement = dropTarget.placement;
	}

	async completeDrop(): Promise<void> {
		const { draggedId, dropTargetId, dropPlacement } = this;
		this.reset();
		if (draggedId === null || dropTargetId === null) return;
		await this.submitReorder(draggedId, dropTargetId, dropPlacement);
	}

	reset(): void {
		this.#autoScroller.stop();
		this.draggedId = null;
		this.draggedGroupId = null;
		this.dropTargetId = null;
	}
}
