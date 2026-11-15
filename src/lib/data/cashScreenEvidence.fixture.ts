import { accountsOutcomes, readMethods, type AccountsReading } from './accountsReadingRules';
import { connectionKinds, type CompanyConnection, type ConnectionKind, type ConnectionsReading } from './connectionRules';
import type { CompanyEvidence } from './cashScreenOutcome';

export const leastCash = 100_000;
export const screenedNumber = '01234567';
export const connectedNumber = '07654321';

/** A reading of a company's latest accounts made up to 31 March 2026, with the outcome and figures given. */
export function readingOf(companyNumber: string, outcome: AccountsReading['outcome'], figures: Partial<AccountsReading> = {}): AccountsReading {
	return {
		companyNumber,
		outcome,
		readMethod: readMethods.taggedFigures,
		accountsType: 'full',
		madeUpTo: '2026-03-31',
		transactionId: '',
		cash: null,
		currentAssets: null,
		netAssets: null,
		creditors: null,
		averageEmployees: null,
		documentUrl: 'https://find-and-update.company-information.service.gov.uk/company/01234567/filing-history',
		readPage: '',
		readByAccountId: null,
		readAt: '2026-11-14T12:00:00Z',
		...figures
	};
}

export function cashOf(companyNumber: string, cash: number): AccountsReading {
	return readingOf(companyNumber, accountsOutcomes.cashStated, { cash });
}

export function connectedThrough(kind: ConnectionKind, leftOutOfficers: string[] = []): ConnectionsReading {
	const connection: CompanyConnection = { connectedCompanyNumber: connectedNumber, connectedCompanyName: 'SISTER BUILD LTD', kind, throughName: 'Jane SMITH' };
	return { companyNumber: screenedNumber, connections: [connection], leftOutOfficers, checkedAt: '2026-11-14T12:00:00Z' };
}

export function noConnections(leftOutOfficers: string[] = []): ConnectionsReading {
	return { ...connectedThrough(connectionKinds.directorSits, leftOutOfficers), connections: [] };
}

export function evidenceOf(own: AccountsReading, connections: ConnectionsReading | null, connected: AccountsReading[] = []): CompanyEvidence {
	return { own, connections, connectedReadings: new Map(connected.map((reading) => [reading.companyNumber, reading])) };
}
