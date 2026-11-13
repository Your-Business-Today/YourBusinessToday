import { countOf } from './countOf';
import type { ContinuityCopy } from './continuityCopy';
import { listedInWords } from './listedInWords';

/** What a client record holds that makes it a real relationship rather than a duplicate or a mistake. */
export type ClientStanding = {
	projectCount: number;
	invoiceCount: number;
	groupedCompanyCount: number;
	hasContinuityCopy: boolean;
};

const continuityCopyReason = 'a continuity copy recorded';
const keepInstead = 'Move it to dormant or lost instead, so the register keeps it and its history.';

/** What deleting a record does, said before anyone confirms it. */
export function deletionWarningFor(clientName: string): string {
	return (
		`Deletes “${clientName}” with its contacts and history, recorded under your name. A record with ` +
		'projects, invoices, grouped companies or a continuity copy is refused: set it to Dormant or Lost instead.'
	);
}

/** Why the client must stay on the register, or null when it is a record that can be deleted. */
export function refusalToDeleteClient(clientName: string, standing: ClientStanding): string | null {
	const reasons = reasonsToKeep(standing);
	if (reasons.length === 0) return null;
	return `${clientName} cannot be deleted: it has ${listedInWords(reasons)}. ${keepInstead}`;
}

/** Why a client the database still names elsewhere, in a record the standing does not count, stays. */
export function refusalWhileStillNamed(clientName: string): string {
	return `${clientName} cannot be deleted: another record still names it. ${keepInstead}`;
}

export function isContinuityCopyRecorded(continuityCopy: ContinuityCopy): boolean {
	const recordedParts = Object.values(continuityCopy);
	return recordedParts.some((part) => part !== null);
}

function reasonsToKeep(standing: ClientStanding): string[] {
	const reasons = [
		countedReason(standing.projectCount, (count) => countOf(count, 'project')),
		countedReason(standing.invoiceCount, (count) => countOf(count, 'invoice')),
		countedReason(standing.groupedCompanyCount, groupedCompanies),
		standing.hasContinuityCopy ? continuityCopyReason : null
	];
	return reasons.filter((reason): reason is string => reason !== null);
}

function countedReason(count: number, describe: (count: number) => string): string | null {
	if (count === 0) return null;
	return describe(count);
}

function groupedCompanies(count: number): string {
	if (count === 1) return 'one company grouped under it';
	return `${count} companies grouped under it`;
}
