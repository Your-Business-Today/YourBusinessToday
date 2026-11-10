import { describeTraitValue } from '../values/traitValue';
import { facets, type Facet } from '../facets';
import type { Medium } from '../mediums/mediumDefinition';
import type { ResolvedBrand, ResolvedTrait } from '../resolution/resolvedBrand';
import type { TraitDefinition } from '../traits/traitDefinition';

export function brandBriefOf(brandName: string, brand: ResolvedBrand): string {
	const sections = facets
		.map((facet) => sectionFor(facet, brand.traits))
		.filter((section) => section !== null);
	return [
		`Brand brief: ${brandName}, for ${mediumNameOf(brand.medium)}`,
		...sections,
		gapsLine(brand.gaps),
		problemsLine(brand.problems)
	]
		.filter((line) => line !== null)
		.join('\n\n');
}

function mediumNameOf(medium: Medium): string {
	return `${medium.label} (${medium.path})`;
}

function sectionFor(facet: Facet, traits: ResolvedTrait[]): string | null {
	const inFacet = traits.filter((resolved) => resolved.facet === facet.key);
	if (inFacet.length === 0) return null;
	const lines = inFacet.map(
		(resolved) => `- ${resolved.label}: ${describeTraitValue(resolved.value)}`
	);
	return [`${facet.label} — ${facet.question}`, ...lines].join('\n');
}

function gapsLine(gaps: TraitDefinition[]): string | null {
	if (gaps.length === 0) return null;
	return `Not yet decided here: ${gaps.map((trait) => trait.key).join(', ')}`;
}

function problemsLine(problems: string[]): string | null {
	if (problems.length === 0) return null;
	return `Needs fixing: ${problems.join('; ')}`;
}
