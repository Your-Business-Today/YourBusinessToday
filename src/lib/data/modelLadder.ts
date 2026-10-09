export type ModelRung = {
	modelId: string;
	name: string;
	tagline: string;
	inputUsdPerMillionTokens: number;
	outputUsdPerMillionTokens: number;
	floorCredits: number;
};

/**
 * The slider, cheapest to most capable. Rates are Anthropic's published base
 * prices (September 2026); floorCredits is the reserve taken before a
 * question and the least it can ever cost — proportional to the input rate
 * so the ladder reads 1× / 2× / 5× / 10×.
 */
export const modelLadder: ModelRung[] = [
	{
		modelId: 'claude-haiku-4-5',
		name: 'Haiku 4.5',
		tagline: 'Fast and frugal — everyday questions',
		inputUsdPerMillionTokens: 1,
		outputUsdPerMillionTokens: 5,
		floorCredits: 10
	},
	{
		modelId: 'claude-sonnet-5',
		name: 'Sonnet 5',
		tagline: 'The balanced choice — sharper answers, still quick',
		inputUsdPerMillionTokens: 2,
		outputUsdPerMillionTokens: 10,
		floorCredits: 20
	},
	{
		modelId: 'claude-opus-5',
		name: 'Opus 5',
		tagline: 'Deep reasoning for hard, multi-step questions',
		inputUsdPerMillionTokens: 5,
		outputUsdPerMillionTokens: 25,
		floorCredits: 50
	},
	{
		modelId: 'claude-fable-5-1',
		name: 'Fable 5.1',
		tagline: 'The most capable Claude there is',
		inputUsdPerMillionTokens: 10,
		outputUsdPerMillionTokens: 50,
		floorCredits: 100
	}
];

export const cheapestModelId = modelLadder[0].modelId;

/**
 * Models the site setting or an admin pin may still name; priced at a rung
 * whose rates are at least theirs so an old id can never undercut the
 * ladder (Sonnet 4.x bills $3/$15, above Sonnet 5, so it rides on Opus).
 */
const legacyModelRungs: Record<string, string> = {
	'claude-sonnet-4-5': 'claude-opus-5',
	'claude-sonnet-4-6': 'claude-opus-5',
	'claude-opus-4-5': 'claude-opus-5',
	'claude-opus-4-6': 'claude-opus-5',
	'claude-opus-4-7': 'claude-opus-5',
	'claude-opus-4-8': 'claude-opus-5',
	'claude-fable-5': 'claude-fable-5-1'
};

export function isLadderModel(modelId: string): boolean {
	return modelLadder.some((rung) => rung.modelId === modelId);
}

export function isKnownModel(modelId: string): boolean {
	return isLadderModel(modelId) || modelId in legacyModelRungs;
}

/**
 * Dated ids ('claude-haiku-4-5-20251001') match their rung by prefix; an id
 * nothing recognises prices at the top rung, so a surprise never undercharges.
 */
export function rungFor(modelId: string): ModelRung {
	const ladderId = legacyModelRungs[modelId] ?? modelId;
	return (
		modelLadder.find((rung) => ladderId.startsWith(rung.modelId)) ??
		modelLadder[modelLadder.length - 1]
	);
}

export function rungIndexFor(modelId: string): number {
	return modelLadder.indexOf(rungFor(modelId));
}
