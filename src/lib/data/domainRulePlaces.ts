import type { DomainRule } from './domainReading';

/** One thing a rule sits on, in a person's words, with the Domain thing or the workflow map station it opens. */
export type RulePlace = { key: string; words: string; thingSlug: string | null; stationKey: string | null };

/** The names a rule's places are read in: each thing's title by its slug, and each station's name by its key. */
export type RulePlaceNames = { thingTitles: Map<string, string>; stationNames: Record<string, string> };

function thingPlace(key: string, thingSlug: string, words: string): RulePlace {
	return { key, words, thingSlug, stationKey: null };
}

function guardedRecordPlaces({ guardsThingSlug, guardsStatus }: DomainRule, { thingTitles }: RulePlaceNames): RulePlace[] {
	if (guardsThingSlug === null) return [];
	const title = thingTitles.get(guardsThingSlug) ?? guardsThingSlug;
	const words = guardsStatus === null ? title : `${title} reaching ${guardsStatus}`;
	return [thingPlace(`guards:${guardsThingSlug}`, guardsThingSlug, words)];
}

function stationPlaces({ guardsStationKeys }: DomainRule, { stationNames }: RulePlaceNames): RulePlace[] {
	return guardsStationKeys.map((stationKey) => ({ key: `station:${stationKey}`, words: stationNames[stationKey] ?? stationKey, thingSlug: null, stationKey }));
}

function eventPlaces({ followsEventSlug }: DomainRule, { thingTitles }: RulePlaceNames): RulePlace[] {
	if (followsEventSlug === null) return [];
	return [thingPlace(`follows:${followsEventSlug}`, followsEventSlug, thingTitles.get(followsEventSlug) ?? followsEventSlug)];
}

function wordPlaces({ definesWord }: DomainRule): RulePlace[] {
	return definesWord === null ? [] : [{ key: `word:${definesWord}`, words: definesWord, thingSlug: null, stationKey: null }];
}

function governedPlaces({ governs }: DomainRule, { thingTitles }: RulePlaceNames): RulePlace[] {
	return governs.map((thingSlug) => thingPlace(`governs:${thingSlug}`, thingSlug, thingTitles.get(thingSlug) ?? thingSlug));
}

/** What a rule sits on, as its kind places it, then the things it governs: a rule with no kind sits on what it governs, as before. */
export function rulePlacesOf(rule: DomainRule, names: RulePlaceNames): RulePlace[] {
	const placed = [...stationPlaces(rule, names), ...guardedRecordPlaces(rule, names), ...eventPlaces(rule, names), ...wordPlaces(rule)];
	const governed = governedPlaces(rule, names);
	const placedKeys = new Set(placed.map((place) => place.thingSlug));
	return [...placed, ...governed.filter((place) => !placedKeys.has(place.thingSlug))];
}
