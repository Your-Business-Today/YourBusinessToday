import { areaEventKinds, type AreaEventKind } from './areaEventKind';

/** What a filing is, read from Companies House's own description id: the first prefix that matches names it. */
export type FilingKind =
	| 'accounts'
	| 'confirmation_statement'
	| 'officer_appointed'
	| 'officer_resigned'
	| 'office_moved'
	| 'charge'
	| 'allotment'
	| 'name_change'
	| 'strike_off_application'
	| 'gazette_notice'
	| 'dissolved'
	| 'insolvency'
	| 'other';

export const filingKinds = {
	accounts: 'accounts',
	confirmationStatement: 'confirmation_statement',
	officerAppointed: 'officer_appointed',
	officerResigned: 'officer_resigned',
	officeMoved: 'office_moved',
	charge: 'charge',
	allotment: 'allotment',
	nameChange: 'name_change',
	strikeOffApplication: 'strike_off_application',
	gazetteNotice: 'gazette_notice',
	dissolved: 'dissolved',
	insolvency: 'insolvency',
	other: 'other'
} as const;

export const filingKindLabels: Record<FilingKind, string> = {
	accounts: 'Accounts',
	confirmation_statement: 'Confirmation statement',
	officer_appointed: 'Director appointed',
	officer_resigned: 'Director gone',
	office_moved: 'Registered office moved',
	charge: 'Charge registered',
	allotment: 'Shares allotted',
	name_change: 'Name changed',
	strike_off_application: 'Strike-off applied for',
	gazette_notice: 'Gazette notice of strike-off',
	dissolved: 'Dissolved',
	insolvency: 'Insolvency form',
	other: 'Filing'
};

/** The description ids, by prefix, in the order they are tried; the official enumeration file names them. */
export const filingDescriptionPrefixes: [string, FilingKind][] = [
	['accounts-with-accounts-type-', 'accounts'],
	['accounts-', 'accounts'],
	['confirmation-statement-', 'confirmation_statement'],
	['appoint-', 'officer_appointed'],
	['termination-', 'officer_resigned'],
	['change-registered-office-address-', 'office_moved'],
	['mortgage-', 'charge'],
	['capital-allotment-', 'allotment'],
	['change-of-name-', 'name_change'],
	['dissolution-application-strike-off-', 'strike_off_application'],
	['gazette-notice-', 'gazette_notice'],
	['gazette-dissolved-', 'dissolved'],
	['liquidation-', 'insolvency'],
	['administration-', 'insolvency'],
	['insolvency-', 'insolvency'],
	['receiver-', 'insolvency'],
	['voluntary-arrangement-', 'insolvency']
];

/** The feed kind each filing kind writes: a filing on its own, or the stronger signal it is. */
export const feedKindOfFiling: Record<FilingKind, AreaEventKind> = {
	accounts: areaEventKinds.filingMade,
	confirmation_statement: areaEventKinds.filingMade,
	officer_appointed: areaEventKinds.officerChanged,
	officer_resigned: areaEventKinds.officerChanged,
	office_moved: areaEventKinds.officeMoved,
	charge: areaEventKinds.filingMade,
	allotment: areaEventKinds.filingMade,
	name_change: areaEventKinds.filingMade,
	strike_off_application: areaEventKinds.proposalToStrikeOff,
	gazette_notice: areaEventKinds.proposalToStrikeOff,
	dissolved: areaEventKinds.strikeOffFinal,
	insolvency: areaEventKinds.insolvencyOpened,
	other: areaEventKinds.filingMade
};

export function filingKindOf(descriptionId: string): FilingKind {
	return filingDescriptionPrefixes.find(([prefix]) => descriptionId.startsWith(prefix))?.[1] ?? 'other';
}
