import { thingStationRoles } from './workflowMap/stationThings';
import type { DomainLifecycleStep } from './businessBrainDomain';
import type { DomainThing } from './domainReading';
import type { ThingStation } from './workflowMap/thingStations';

/** One status of a thing's lifecycle with the stations of today's workflow map that produce the thing in it. */
export type DomainLifecycleRow = DomainLifecycleStep & { reachedBy: ThingStation[] };

/** A thing's statuses a row each, its lifecycle's when it has one, with the stations that bring it there; a status filed alone has no meaning yet. */
export function lifecycleRowsOf({ slug, lifecycle, statuses }: DomainThing, thingStations: ThingStation[]): DomainLifecycleRow[] {
	const steps = lifecycle.length > 0 ? lifecycle : statuses.map(statusAlone);
	const producing = thingStations.filter((station) => station.thingSlug === slug && station.role === thingStationRoles.produces);
	return steps.map((step) => ({ ...step, reachedBy: producing.filter((station) => station.status === step.status) }));
}

function statusAlone(status: string): DomainLifecycleStep {
	return { status, meaning: '', movesTo: [] };
}
