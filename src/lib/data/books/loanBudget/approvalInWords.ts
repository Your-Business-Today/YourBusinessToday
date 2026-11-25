import { formatBritishDate } from '$lib/data/britishDate';
import type { LineApproval } from './loanBudget';

/** Who approved a line and on what day: Nigel Reilly on 26 Nov 2026. */
export function approvalInWords({ approvedByName, approvedAt }: LineApproval): string {
	return `${approvedByName} on ${formatBritishDate(approvedAt)}`;
}
