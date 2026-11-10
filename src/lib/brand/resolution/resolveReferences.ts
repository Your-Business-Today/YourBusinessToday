import { referredTraitKey } from '../values/traitReference';
import type { ResolvedTrait } from './resolvedBrand';
import type { TraitValue } from '../values/traitValue';

type ReferenceOutcome = { value: TraitValue } | { problem: string };

export function resolveReferences(cascaded: ResolvedTrait[]): {
	traits: ResolvedTrait[];
	problems: string[];
} {
	const valuesByKey = new Map(cascaded.map((resolved) => [resolved.trait.key, resolved.value]));
	const traits: ResolvedTrait[] = [];
	const problems: string[] = [];
	for (const resolved of cascaded) {
		const outcome = follow(resolved.trait.key, valuesByKey, []);
		if ('problem' in outcome) problems.push(outcome.problem);
		if ('value' in outcome) traits.push({ ...resolved, value: outcome.value });
	}
	return { traits, problems };
}

function follow(key: string, valuesByKey: Map<string, TraitValue>, visited: string[]): ReferenceOutcome {
	if (visited.includes(key)) return { problem: `${[...visited, key].join(' → ')} goes round in a loop` };
	const value = valuesByKey.get(key);
	if (value === undefined) {
		return { problem: `${visited.at(-1)} refers to ${key}, which is not decided here` };
	}
	const referred = referredTraitKey(value);
	if (referred === null) return { value };
	return follow(referred, valuesByKey, [...visited, key]);
}
