import { describeTraitValue } from '../values/traitValue';
import { facets, type Facet } from '../facets';
import type { ResolvedBrand, ResolvedTrait } from '../resolution/resolvedBrand';

export function brandBriefOf(brandName: string, brand: ResolvedBrand): string {
	const sections = facets
		.map((facet) => sectionFor(facet, brand.traits))
		.filter((section) => section !== null);
	return [
		`Brand brief: ${brandName}, for ${brand.medium.label} (${brand.medium.path})`,
		...sections,
		gapsLine(brand),
		problemsLine(brand)
	]
		.filter((line) => line !== null)
		.join('\n\n');
}

function sectionFor(facet: Facet, traits: ResolvedTrait[]): string | null {
	const inFacet = traits.filter((resolved) => resolved.trait.facet === facet.key);
	if (inFacet.length === 0) return null;
	const lines = inFacet.map(
		(resolved) => `- ${resolved.trait.label}: ${describeTraitValue(resolved.value)}`
	);
	return [`${facet.label} — ${facet.question}`, ...lines].join('\n');
}

function gapsLine(brand: ResolvedBrand): string | null {
	if (brand.gaps.length === 0) return null;
	return `Not yet decided here: ${brand.gaps.map((trait) => trait.key).join(', ')}`;
}

function problemsLine(brand: ResolvedBrand): string | null {
	if (brand.problems.length === 0) return null;
	return `Needs fixing: ${brand.problems.join('; ')}`;
}
