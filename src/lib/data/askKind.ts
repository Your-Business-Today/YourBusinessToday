/** What an ask wants from the person it waits on. Building is never asked of a person. */
export type AskKind = 'information' | 'setup' | 'testing';

export const askKinds = { information: 'information', setup: 'setup', testing: 'testing' } as const;

export const askKindOrder: AskKind[] = ['information', 'setup', 'testing'];

export const defaultAskKind: AskKind = askKinds.information;

export const askKindLabels: Record<AskKind, string> = {
	information: 'Information',
	setup: 'Setup',
	testing: 'Testing'
};

export const askKindMeanings: Record<AskKind, string> = {
	information: 'an answer or a file only they hold',
	setup: 'an account, a key, a DNS record or a payment they put in place',
	testing: 'confirming a merged feature works'
};

export function parseAskKind(value: unknown): AskKind | null {
	return askKindOrder.find((kind) => kind === value) ?? null;
}
