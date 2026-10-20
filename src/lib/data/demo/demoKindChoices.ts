import { DemoKind, type DemoKindValue } from './demoKinds';

export type DemoKindChoice = { kind: DemoKindValue; label: string; sentence: string };

/** The kinds of business offered on the demo link, each with what its made-up business is like. */
export const demoKindChoices: DemoKindChoice[] = [
	{
		kind: DemoKind.construction,
		label: 'Construction',
		sentence: 'A joinery and fit-out firm: jobs on site, valuations, quotes to developers and work done but never invoiced.'
	},
	{
		kind: DemoKind.bookkeeping,
		label: 'Bookkeeping',
		sentence: 'A bookkeeping practice: monthly books, VAT returns, payrolls, year-ends finished and not yet billed.'
	}
];
