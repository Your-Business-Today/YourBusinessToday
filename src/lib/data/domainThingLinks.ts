import type { DomainRule, DomainThing } from './domainReading';
import type { ThingStation } from './workflowMap/thingStations';

/** The rules that name the thing among those they govern. */
export function rulesGoverning(rules: DomainRule[], thingSlug: string): DomainRule[] {
	return rules.filter((rule) => rule.governs.includes(thingSlug));
}

/** The stations of today's workflow map that take the thing in or produce it. */
export function stationsNaming(thingStations: ThingStation[], thingSlug: string): ThingStation[] {
	return thingStations.filter((station) => station.thingSlug === thingSlug);
}

/** The thing filed under the slug, when the address names one the domain holds. */
export function thingNamed(things: DomainThing[], thingSlug: string | null): DomainThing | undefined {
	return things.find((thing) => thing.slug === thingSlug);
}

/** Each thing's title by its slug, so a rule names what it governs in the business's words. */
export function thingTitlesBySlug(things: DomainThing[]): Map<string, string> {
	return new Map(things.map((thing) => [thing.slug, thing.title]));
}

/** The gates that name the station among those they guard. */
export function gatesGuarding(rules: DomainRule[], stationKey: string): DomainRule[] {
	return rules.filter((rule) => rule.guardsStationKeys.includes(stationKey));
}
