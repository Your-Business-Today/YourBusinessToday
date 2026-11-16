import { isInOurProducts, productNameOf } from './mapProductNames';
import { placedStation } from './placedStation';
import { lineKind, stationState, type MapLine, type MapStation, type WorkflowMapVersion } from './workflowMap';
import type { OrganisationWorkflowMaps } from './organisationWorkflowMaps';

/** A step a person still does, inside one of our products. */
export type StepInAProduct = { stationName: string; productName: string };

/** A step the Before gave a person that the After does not: done by a system now, or gone, when nowDoneBy is null. */
export type StepTakenOff = { stationName: string; nowDoneBy: string | null };

/** One role of the After: what stays theirs outside our products, what they do inside them, and what is taken off their hands. */
export type PersonInTheLoop = {
	roleKey: string;
	roleName: string;
	staysTheirs: string[];
	insideOurProducts: StepInAProduct[];
	takenOffTheirHands: StepTakenOff[];
};

/** Every role line of the After, in its order; none until an After is filed. */
export function peopleInTheLoopOf({ before, after, productNames }: OrganisationWorkflowMaps): PersonInTheLoop[] {
	if (after === null) return [];
	const roles = after.lines.filter((line) => line.kind === lineKind.role);
	return roles.map((line) => personOf(line, { before, after, productNames }));
}

function personOf(line: MapLine, { before, after, productNames }: OrganisationWorkflowMaps & { after: WorkflowMapVersion }): PersonInTheLoop {
	const staysTheirs = line.stations.filter((station) => station.state === stationState.elsewhere);
	const inside = line.stations.filter(isInOurProducts);
	return {
		roleKey: line.key,
		roleName: line.name,
		staysTheirs: staysTheirs.map((station) => station.name),
		insideOurProducts: inside.map((station) => ({ stationName: station.name, productName: productNameOf(station, productNames) })),
		takenOffTheirHands: before === null ? [] : takenOffTheirHands(before, after, line.key)
	};
}

function takenOffTheirHands(before: WorkflowMapVersion, after: WorkflowMapVersion, roleKey: string): StepTakenOff[] {
	const earlierLine = before.lines.find((line) => line.key === roleKey);
	const earlierStations = earlierLine?.stations ?? [];
	return earlierStations.flatMap((station) => stepTakenOff(after, station));
}

function stepTakenOff(after: WorkflowMapVersion, station: MapStation): StepTakenOff[] {
	const later = placedStation(after, station.key);
	if (later === null) return [{ stationName: station.name, nowDoneBy: null }];
	if (later.lineKind !== lineKind.system) return [];
	return [{ stationName: station.name, nowDoneBy: later.lineName }];
}
