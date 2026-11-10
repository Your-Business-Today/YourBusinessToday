import { decisionSourceLabels } from '../decisions/decisionSourceLabels';
import { describeTraitValue } from '../values/traitValue';
import { everywherePath } from '../mediums/mediumDefinition';
import { findMedium } from '../mediums/mediumCatalogue';
import { findTrait } from '../traits/traitCatalogue';
import { postKindsTraitKey } from '../postKinds/postKinds';
import { sheetPlaceOf, type SheetPlace } from './brandSheetSections';
import { styledFacets } from './cssVariables';
import type { Decision } from '../decisions/decision';
import type { FacetKey } from '../facets';
import type { ResolvedBrand, ResolvedTrait } from '../resolution/resolvedBrand';
import type { TraitDefinition } from '../traits/traitDefinition';

export type KitEntry = { key: string; label: string; purpose: string; value: string; reason: string; source: string; decidedOn: string };

export type ChannelEntry = KitEntry & { channel: string };

export type BrandKitPage = {
	palette: KitEntry[];
	type: KitEntry[];
	spacingAndShape: KitEntry[];
	voice: KitEntry[];
	postKinds: KitEntry[];
	audience: KitEntry[];
	neverSay: KitEntry[];
	forOneChannel: ChannelEntry[];
};

export type BrandKitReading = { brand: ResolvedBrand; catalogue: TraitDefinition[]; decisions: Decision[] };

const neverSayKeys = ['voice.wordsToAvoid', 'voice.topicsToAvoid'];
const adoptedStatus = 'adopted';

/** The kit as the client's brand kit page shows it: what holds everywhere, by section, and what holds for one channel only. */
export function brandKitPageOf({ brand, catalogue, decisions }: BrandKitReading): BrandKitPage {
	const entries = brand.traits.map((trait) => ({ trait, entry: entryOf(trait, decisions) }));
	const where = (isIn: (trait: ResolvedTrait) => boolean) => entries.filter(({ trait }) => isIn(trait)).map(({ entry }) => entry);
	return {
		palette: where(isPlacedAt(['palette'])),
		type: where(isPlacedAt(['type'])),
		spacingAndShape: where(isPlacedAt(['spacing', 'shapeAndMotion'])),
		voice: where((trait) => isInFacet(trait, 'voice') && !isNeverSay(trait) && !isPostKinds(trait)),
		postKinds: where(isPostKinds),
		audience: where((trait) => isInFacet(trait, 'audience')),
		neverSay: where(isNeverSay),
		forOneChannel: decisions.filter(holdsForOneChannel).map((decision) => channelEntryOf(decision, catalogue))
	};
}

function isPlacedAt(places: SheetPlace[]): (trait: ResolvedTrait) => boolean {
	return (trait) => styledFacets.includes(trait.facet) && places.includes(sheetPlaceOf(trait));
}

function isInFacet(trait: TraitDefinition, facet: FacetKey): boolean {
	return trait.facet === facet;
}

function isNeverSay(trait: TraitDefinition): boolean {
	return neverSayKeys.includes(trait.key);
}

function isPostKinds(trait: TraitDefinition): boolean {
	return trait.key === postKindsTraitKey;
}

function holdsForOneChannel(decision: Decision): boolean {
	return decision.status === adoptedStatus && decision.mediumPath !== everywherePath;
}

function entryOf(trait: ResolvedTrait, decisions: Decision[]): KitEntry {
	const decision = decisions.find((candidate) => candidate.id === trait.decisionId);
	const value = describeTraitValue(trait.value);
	return { key: trait.key, label: trait.label, purpose: trait.purpose, value, ...provenanceOf(decision) };
}

function channelEntryOf(decision: Decision, catalogue: TraitDefinition[]): ChannelEntry {
	const trait = findTrait(catalogue, decision.traitKey);
	const medium = findMedium(decision.mediumPath);
	const naming = { key: `${decision.traitKey}@${decision.mediumPath}`, label: trait?.label ?? decision.traitKey, purpose: trait?.purpose ?? '' };
	const value = describeTraitValue(decision.value);
	return { ...naming, value, channel: medium?.label ?? decision.mediumPath, ...provenanceOf(decision) };
}

function provenanceOf(decision: Decision | undefined): Pick<KitEntry, 'reason' | 'source' | 'decidedOn'> {
	if (decision === undefined) return { reason: '', source: '', decidedOn: '' };
	return { reason: decision.rationale, source: decisionSourceLabels[decision.source], decidedOn: decision.decidedAt };
}
