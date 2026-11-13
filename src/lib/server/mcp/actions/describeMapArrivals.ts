import type { MapArrival, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const noneFiled = 'None filed: nothing is said to arrive from outside to start the work.';

/** What arrives from outside the map, each as a sentence naming the station it starts. */
export function arrivalSection({ arrivals }: WorkflowMapVersion, placeOf: Map<string, string>): string {
	if (arrivals.length === 0) return `### Arrivals from outside\n\n${noneFiled}`;
	const sentences = arrivals.map((arrival) => `- ${describeArrival(arrival, placeOf)}`);
	return ['### Arrivals from outside', ...sentences].join('\n');
}

function describeArrival(arrival: MapArrival, placeOf: Map<string, string>): string {
	const started = placeOf.get(arrival.stationKey) ?? arrival.stationKey;
	return `**${arrival.whatArrives}** arrives from ${arrival.arrivesFrom} and starts ${started}.`;
}
