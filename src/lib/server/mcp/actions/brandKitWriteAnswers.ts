import { KitLimits } from '$lib/brand/kitLimits';
import type { BrandDecisionStanding } from '$lib/server/brandKits/brandDecisionStatus';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';

/** An organisation's brand or a product's, by the name its answers use. */
type NamedBrand = { name: string };

export const noSuchDecision = 'No decision of that id is in this brand kit. Call read_brand for the ids.';

export const adoptedMeanwhile =
	'Another decision was adopted at the same trait and medium in the same moment, so this one was not. ' +
	'Call read_brand, and adopt it again if it should hold.';

export function noBrandYet(brand: NamedBrand): string {
	return `${brand.name} has no brand yet. Say what it is first with describe_brand.`;
}

/** Why the summary cannot be kept in its column, or null when it can. */
export function validateBrandSummary(summary: string): string | null {
	if (summary === '') return 'The summary is empty: say what the brand is in a sentence or two.';
	if (summary.length <= KitLimits.summaryCharacters) return null;
	return `The summary is ${summary.length} characters; keep it to ${KitLimits.summaryCharacters}. Nothing was changed.`;
}

export function brandStarted(brand: NamedBrand, summary: string): string {
	return `${brand.name} now has a brand: ${summary}\n\nDecide its kit with record_brand_decisions.`;
}

export function brandRedescribed(brand: NamedBrand, summary: string, earlierSummary: string): string {
	const earlier = earlierSummary === '' ? 'nothing yet' : earlierSummary;
	return `${brand.name}’s brand now reads: ${summary}\n\nIt read: ${earlier}`;
}

export function traitDefined(brand: NamedBrand, trait: TraitDefinition): string {
	return `${trait.key} [${trait.kind}] is now a trait of ${brand.name}’s brand. Decide it with record_brand_decisions.`;
}

export function traitAlreadyDefined(brand: NamedBrand, traitKey: string): string {
	return `${brand.name}’s brand already has ${traitKey}, so nothing was changed.`;
}

export function traitRefused(problem: string): string {
	return `The trait was not defined: ${problem}.`;
}

export function decisionAlready(decision: BrandDecisionStanding): string {
	return `${placeOf(decision)} is already ${decision.status}, so nothing was changed.`;
}

export function decisionMovedTo(decision: BrandDecisionStanding, status: string): string {
	return `${placeOf(decision)} (id ${decision.id}) is now ${status}. It was ${decision.status}.`;
}

function placeOf(decision: BrandDecisionStanding): string {
	return `The decision on ${decision.traitKey} @ ${decision.mediumPath}`;
}
