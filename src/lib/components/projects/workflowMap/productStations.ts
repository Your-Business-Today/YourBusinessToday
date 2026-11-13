import { firstLineColour } from '$lib/components/organisations/workflowMap/workflowLineMap';
import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';
import type { MapLine, MapStation, StationState, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** One station the product runs, as its table lists it: the task, the role that does it and what passes through it. */
export type ProductStation = {
	key: string;
	name: string;
	roleName: string;
	roleColour: LineColour;
	takesIn: string;
	produces: string;
	state: StationState;
};

const listJoiner = ', ';

/** The stations a map names the product on, in the order the map's roles and their tasks are filed. */
export function productStationsOf(version: WorkflowMapVersion, productId: string, colours: Map<string, LineColour>): ProductStation[] {
	return version.lines.flatMap((line) => {
		const roleColour = colours.get(line.key) ?? firstLineColour;
		const runHere = line.stations.filter((station) => station.productId === productId);
		return runHere.map((station) => productStationOf(station, line, roleColour));
	});
}

function productStationOf(station: MapStation, line: MapLine, roleColour: LineColour): ProductStation {
	const { key, name, state } = station;
	const takesIn = station.takesIn.join(listJoiner);
	const produces = station.produces.join(listJoiner);
	return { key, name, roleName: line.name, roleColour, takesIn, produces, state };
}
