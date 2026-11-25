import type { TeamWorkItem } from './organisationTeamWork';

/** What the assignee filter asks for to see the jobs nobody has taken. */
export const nobodyAssigned = 'nobody';

/** What narrows the Tasks page's list: whose move the job is, its product and where it stands. Null lets every job through. */
export type TeamWorkFilter = { assignedTo: string | null; productId: string | null; status: string | null };

export type TeamWorkFilterField = keyof TeamWorkFilter;

export const everyJob: TeamWorkFilter = { assignedTo: null, productId: null, status: null };

/** The jobs the filter lets through, in the order given. */
export function jobsShownBy(items: TeamWorkItem[], filter: TeamWorkFilter): TeamWorkItem[] {
	return items.filter((item) => isShownBy(item, filter));
}

function isShownBy(item: TeamWorkItem, filter: TeamWorkFilter): boolean {
	const isWithAskedPerson = isMoveAsAsked(item, filter.assignedTo);
	const isOnAskedProduct = isAsked(item.productId, filter.productId);
	const isAtAskedStatus = isAsked(item.status, filter.status);
	return isWithAskedPerson && isOnAskedProduct && isAtAskedStatus;
}

function isAsked(value: string, asked: string | null): boolean {
	return asked === null || value === asked;
}

/** A person's jobs are the ones whose next move is theirs; "nobody" still asks for the jobs nobody has taken. */
function isMoveAsAsked(item: TeamWorkItem, assignedTo: string | null): boolean {
	if (assignedTo === null) return true;
	if (assignedTo === nobodyAssigned) return item.assigneeIds.length === 0;
	return item.nextActionIds.includes(assignedTo);
}
