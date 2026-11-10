import { canExpress } from '../mediums/mediumExpression';
import { depthOf, isWithinPath } from '../mediums/mediumPaths';
import { resolveReferences } from './resolveReferences';
import type { Decision } from '../decisions/decision';
import type { Medium } from '../mediums/mediumDefinition';
import type { ResolvedBrand, ResolvedTrait } from './resolvedBrand';
import type { TraitDefinition } from '../traits/traitDefinition';

export function resolveBrand(
	decisions: Decision[],
	catalogue: TraitDefinition[],
	medium: Medium
): ResolvedBrand {
	const expressible = catalogue.filter((trait) => canExpress(medium, trait));
	const adopted = decisions.filter((decision) => decision.status === 'adopted');
	const cascaded = expressible
		.map((trait) => cascade(trait, adopted, medium))
		.filter((resolved): resolved is ResolvedTrait => resolved !== null);
	const { traits, problems } = resolveReferences(cascaded);
	const decidedKeys = new Set(cascaded.map((resolved) => resolved.trait.key));
	const gaps = expressible.filter((trait) => !decidedKeys.has(trait.key));
	return { medium, traits, gaps, problems };
}

function cascade(trait: TraitDefinition, adopted: Decision[], medium: Medium): ResolvedTrait | null {
	const nearest = adopted
		.filter((decision) => decision.traitKey === trait.key)
		.filter((decision) => isWithinPath(medium.path, decision.mediumPath))
		.sort((left, right) => depthOf(right.mediumPath) - depthOf(left.mediumPath))[0];
	if (nearest === undefined) return null;
	return { trait, value: nearest.value, decidedAt: nearest.mediumPath, decisionId: nearest.id };
}
