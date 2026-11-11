import { taskStatusChoices, type StatusChoice } from './internalWorkStyles';
import type { InternalItem } from './internalWorkGroups';

/** One column of the status board: a status in monday.com's words and the items standing at it. */
export type StatusBoardColumn = StatusChoice & { items: InternalItem[]; itemCount: number };

export function statusBoardColumnsOf(items: InternalItem[]): StatusBoardColumn[] {
	return taskStatusChoices.map((status) => {
		const itemsAtStatus = items.filter(({ task }) => task.status === status.value);
		return { ...status, items: itemsAtStatus, itemCount: itemsAtStatus.length };
	});
}
