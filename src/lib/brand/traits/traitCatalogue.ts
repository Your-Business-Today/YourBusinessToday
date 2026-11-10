import { audienceTraits } from './audienceTraits';
import { behaviourTraits, responseTraits } from './actionTraits';
import { lookTraits } from './lookTraits';
import { motionTraits } from './motionTraits';
import { soundTraits } from './soundTraits';
import { voiceTraits } from './voiceTraits';
import type { TraitDefinition } from './traitDefinition';

export const builtInTraits: TraitDefinition[] = [
	...lookTraits,
	...motionTraits,
	...soundTraits,
	...voiceTraits,
	...behaviourTraits,
	...responseTraits,
	...audienceTraits
];

export function catalogueWith(customTraits: TraitDefinition[]): TraitDefinition[] {
	return [...builtInTraits, ...customTraits];
}

export function findTrait(catalogue: TraitDefinition[], key: string): TraitDefinition | null {
	return catalogue.find((trait) => trait.key === key) ?? null;
}
