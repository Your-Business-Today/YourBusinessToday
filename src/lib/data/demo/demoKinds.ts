/** The kinds of business a prospect can try the demo as. */
export const DemoKind = {
	construction: 'construction',
	bookkeeping: 'bookkeeping'
} as const;
export type DemoKindValue = (typeof DemoKind)[keyof typeof DemoKind];

export const demoKinds: DemoKindValue[] = Object.values(DemoKind);

/** A copy started before there was a choice of kind is the construction business. */
export const firstDemoKind: DemoKindValue = DemoKind.construction;

export function isDemoKind(value: unknown): value is DemoKindValue {
	return demoKinds.includes(value as DemoKindValue);
}

export const unknownDemoKindSentence = `Choose the kind of business to try: ${demoKinds.join(' or ')}.`;
