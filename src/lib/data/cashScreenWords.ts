import { accountsOutcomes, type AccountsReading } from './accountsReadingRules';
import { connectionKinds, mostAppointmentsForARealDirector, type CompanyConnection } from './connectionRules';
import { formatBritishDate } from './britishDate';
import { formatPounds } from './filedFigures';
import type { ConnectedReading } from './cashScreenOutcome';

/** The sentences a screen gives for each company's outcome, each with the day its figures hold for. */
export function ownCashWords(reading: AccountsReading): string {
	return `Cash at bank ${formatPounds(reading.cash ?? 0)} on ${dayWords(reading)}.`;
}

export function microEntityWords(reading: AccountsReading): string {
	return `A micro-entity, so cash is not stated, but current assets were ${formatPounds(reading.currentAssets ?? 0)} on ${dayWords(reading)}.`;
}

export function pdfWords(reading: AccountsReading): string {
	return `Its accounts were filed only as a PDF and nobody has read them yet: read the balance sheet at ${reading.documentUrl} and save it with save_company_accounts_reading.`;
}

/** Said of a company the screen reached and has no reading for: nobody knows its cash, which is not the same as its having none. */
export const unreadWords = 'Its accounts could not be read from Companies House this time, so its cash is not known: read_company_accounts reads them again.';

export function leftOutWords(officers: string[]): string {
	return `Left out for holding more than ${mostAppointmentsForARealDirector} appointments, so their companies were not read: ${officers.join(', ')}.`;
}

const relationWords: Record<CompanyConnection['kind'], (connection: CompanyConnection) => string> = {
	[connectionKinds.directorOwns]: (connection) => `owned by its director ${connection.throughName}`,
	[connectionKinds.directorSits]: (connection) => `where its director ${connection.throughName} sits on the board`,
	[connectionKinds.ownsThisCompany]: () => 'which owns over 25% of it'
};

export function throughWords(connected: ConnectedReading): string {
	const { connection, reading } = connected;
	const figure = reading.outcome === accountsOutcomes.cashStated ? ownCashWords(reading) : microEntityWords(reading);
	const relation = relationWords[connection.kind](connection);
	return `${connection.connectedCompanyName} (${connection.connectedCompanyNumber}), ${relation}. ${figure}`;
}

const shortOfWords: Record<AccountsReading['outcome'], (reading: AccountsReading, leastCash: number) => string> = {
	[accountsOutcomes.cashStated]: (reading, leastCash) => `Cash at bank ${formatPounds(reading.cash ?? 0)} on ${dayWords(reading)}, short of ${formatPounds(leastCash)}.`,
	[accountsOutcomes.cashNotStated]: (reading) => `Cash is not stated in its accounts made up to ${dayWords(reading)}, and current assets do not reach the figure.`,
	[accountsOutcomes.dormant]: (reading) => `Dormant accounts made up to ${dayWords(reading)}.`,
	[accountsOutcomes.noAccounts]: () => 'No accounts filed yet.',
	[accountsOutcomes.pdfOnly]: (reading) => `Filed only as a PDF, made up to ${dayWords(reading)}.`
};

export function failWords(reading: AccountsReading, leastCash: number): string {
	return `${shortOfWords[reading.outcome](reading, leastCash)} No company it owns or that owns it has that much either.`;
}

function dayWords(reading: AccountsReading): string {
	return reading.madeUpTo === null ? 'an unstated date' : formatBritishDate(reading.madeUpTo);
}
