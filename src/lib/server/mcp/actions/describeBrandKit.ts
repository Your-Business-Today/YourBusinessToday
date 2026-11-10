import { describeTraitValue } from '$lib/brand/values/traitValue';
import { everywherePath, type Medium } from '$lib/brand/mediums/mediumDefinition';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { resolveBrand } from '$lib/brand/resolution/resolveBrand';
import type { BrandKit } from '$lib/server/brandKits/loadBrandKit';
import type { Decision } from '$lib/brand/decisions/decision';

const everywhere = findMedium(everywherePath) as Medium;

/** Every decision in force or proposed, at every medium, and the traits nothing has decided yet. */
export function describeBrandKit(organisationName: string, kit: BrandKit): string {
	const gaps = resolveBrand(kit.decisions, kit.catalogue, everywhere).gaps;
	const gapsLine = `Not yet decided anywhere: ${gaps.map((trait) => trait.key).join(', ')}`;
	if (kit.decisions.length === 0) return `${emptyKitLine(organisationName)}\n\n${gapsLine}`;
	const decisionLines = kit.decisions.map(decisionLine);
	const heading = `${organisationName}: ${kit.decisions.length} decisions in force or proposed`;
	const sections = [[heading, ...decisionLines].join('\n')];
	if (gaps.length > 0) sections.push(gapsLine);
	return sections.join('\n\n');
}

function emptyKitLine(organisationName: string): string {
	return `${organisationName} has nothing decided yet, so its brand kit is empty.`;
}

function decisionLine(decision: Decision): string {
	const rationale = decision.rationale === '' ? '' : ` — ${decision.rationale}`;
	const value = describeTraitValue(decision.value);
	const where = `${decision.traitKey} @ ${decision.mediumPath}`;
	return `- [${decision.status}] ${where} = ${value} (id ${decision.id}, ${decision.source})${rationale}`;
}
