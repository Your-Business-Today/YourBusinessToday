export const traitKinds = [
	'colour',
	'length',
	'duration',
	'easing',
	'fontFamily',
	'fontWeight',
	'number',
	'ratio',
	'phrase',
	'phraseList',
	'choice',
	'actionRule'
] as const;

export type TraitKind = (typeof traitKinds)[number];

export const actionStances = ['always', 'often', 'sometimes', 'never'] as const;

export type ActionStance = (typeof actionStances)[number];

export type ActionRule = { stance: ActionStance; guidance: string };

export type TraitValue = string | number | string[] | ActionRule;

export function isTraitKind(candidate: string): candidate is TraitKind {
	return (traitKinds as readonly string[]).includes(candidate);
}

export function isActionStance(candidate: unknown): candidate is ActionStance {
	return (actionStances as readonly unknown[]).includes(candidate);
}

export function isActionRule(value: TraitValue): value is ActionRule {
	return typeof value === 'object' && !Array.isArray(value);
}

export function describeTraitValue(value: TraitValue): string {
	if (Array.isArray(value)) return value.join(', ');
	if (isActionRule(value)) return `${value.stance} — ${value.guidance}`;
	return String(value);
}
