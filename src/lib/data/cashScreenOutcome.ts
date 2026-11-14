import { accountsOutcomes, type AccountsReading } from './accountsReadingRules';
import { connectionKinds, type CompanyConnection, type ConnectionsReading } from './connectionRules';
import { failWords, leftOutWords, microEntityWords, ownCashWords, pdfWords, throughWords } from './cashScreenWords';

/** What a screened company comes out as, one of four. */
export const cashScreenOutcomes = { passes: 'passes', passesThroughConnected: 'passes_through_connected', maybe: 'maybe', fails: 'fails' } as const;
export type CashScreenOutcome = (typeof cashScreenOutcomes)[keyof typeof cashScreenOutcomes];

/** What a company's outcome is worked out from: its own reading, who is behind it, and the readings of those it is connected to. */
export type CompanyEvidence = { own: AccountsReading; connections: ConnectionsReading | null; connectedReadings: Map<string, AccountsReading> };

/** A company's outcome with the sentence that says why, and the day the deciding accounts are made up to. */
export type ScreenVerdict = { outcome: CashScreenOutcome; reason: string; madeUpTo: string | null };

/** A connected company whose cash counts as the company's own: one it owns through a director, or one that owns it. */
export const ownedKinds: CompanyConnection['kind'][] = [connectionKinds.directorOwns, connectionKinds.ownsThisCompany];

export function screenVerdict(evidence: CompanyEvidence, leastCash: number): ScreenVerdict {
	const { own } = evidence;
	const isOwnCashEnough = hasCashOf(own, leastCash);
	if (isOwnCashEnough) return { outcome: cashScreenOutcomes.passes, reason: ownCashWords(own), madeUpTo: own.madeUpTo };
	const passingOwner = connectedWith(evidence, ownedKinds, (reading) => hasCashOf(reading, leastCash));
	if (passingOwner !== null) return passesThrough(passingOwner);
	const maybeReasons = maybeReasonsFor(evidence, leastCash);
	if (maybeReasons.length > 0) return { outcome: cashScreenOutcomes.maybe, reason: maybeReasons.join(' '), madeUpTo: own.madeUpTo };
	return { outcome: cashScreenOutcomes.fails, reason: failWords(own, leastCash), madeUpTo: own.madeUpTo };
}

export function hasCashOf(reading: AccountsReading, leastCash: number): boolean {
	return reading.outcome === accountsOutcomes.cashStated && (reading.cash ?? 0) >= leastCash;
}

function hasCurrentAssetsOf(reading: AccountsReading, leastCash: number): boolean {
	return reading.outcome === accountsOutcomes.cashNotStated && (reading.currentAssets ?? 0) >= leastCash;
}

export type ConnectedReading = { connection: CompanyConnection; reading: AccountsReading };

function connectedWith(evidence: CompanyEvidence, kinds: CompanyConnection['kind'][], isMatch: (reading: AccountsReading) => boolean): ConnectedReading | null {
	const { connections: connectionsReading } = evidence;
	const connections = connectionsReading?.connections ?? [];
	for (const connection of connections.filter((candidate) => kinds.includes(candidate.kind))) {
		const reading = evidence.connectedReadings.get(connection.connectedCompanyNumber);
		if (reading !== undefined && isMatch(reading)) return { connection, reading };
	}
	return null;
}

function passesThrough(passingOwner: ConnectedReading): ScreenVerdict {
	const { reading } = passingOwner;
	return { outcome: cashScreenOutcomes.passesThroughConnected, reason: throughWords(passingOwner), madeUpTo: reading.madeUpTo };
}

function maybeReasonsFor(evidence: CompanyEvidence, leastCash: number): string[] {
	const { own } = evidence;
	const isOwnMicroEntityEnough = hasCurrentAssetsOf(own, leastCash);
	const ownedMicroEntity = connectedWith(evidence, [connectionKinds.directorOwns], (reading) => hasCurrentAssetsOf(reading, leastCash));
	const satOnWithCash = connectedWith(evidence, [connectionKinds.directorSits], (reading) => hasCashOf(reading, leastCash));
	const { connections } = evidence;
	const leftOut = connections?.leftOutOfficers ?? [];
	return [
		isOwnMicroEntityEnough ? microEntityWords(own) : '',
		ownedMicroEntity === null ? '' : `A director owns a micro-entity: ${throughWords(ownedMicroEntity)}`,
		satOnWithCash === null ? '' : `A director only sits on, and does not own, ${throughWords(satOnWithCash)}`,
		own.outcome === accountsOutcomes.pdfOnly ? pdfWords(own) : '',
		leftOut.length === 0 ? '' : leftOutWords(leftOut)
	].filter((reason) => reason !== '');
}
