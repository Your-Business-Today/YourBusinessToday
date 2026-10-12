import { areaEventKinds, type AreaEventKind } from './areaEventKind';

/** The feed's Filings chip: everything Companies House's own records say about a company, keyed and keyless alike. */
export const filingFeedKinds: AreaEventKind[] = [
	areaEventKinds.accountsFiled,
	areaEventKinds.figuresRead,
	areaEventKinds.filingMade,
	areaEventKinds.officerChanged,
	areaEventKinds.officeMoved,
	areaEventKinds.proposalToStrikeOff,
	areaEventKinds.strikeOffFinal,
	areaEventKinds.insolvencyOpened,
	areaEventKinds.indicatorChanged
];

export const filingsGroup = 'filings';
