import type { HandoverBranch, LineMapLayout, StationLabel, StationPlace } from './layout/lineMapLayout';
import { StationKinds, StationStates, type LineColour, type LineMapModel, type StationKind, type StationState } from './layout/lineMapModel';
import { colourOfStation, stationsOnLines } from './layout/stationLines';

export type Lighting = { selectedStationId?: string; litStationIds?: string[] };

export type DrawnStation = {
	id: string;
	name: string;
	description?: string;
	kind: StationKind;
	state: StationState;
	place: StationPlace;
	label: StationLabel;
	colour: LineColour;
	isShared: boolean;
	isArrivedAt: boolean;
	isGoingBack: boolean;
	isSelected: boolean;
	isDimmed: boolean;
};

export function drawnStations(model: LineMapModel, layout: LineMapLayout, branches: HandoverBranch[], lighting: Lighting): DrawnStation[] {
	const arrivals = new Set(branches.map((branch) => branch.to));
	const goingBack = new Set(model.handovers.map((handover) => handover.from).filter((stationId) => layout.goingBack.includes(stationId)));
	const { litStationIds, selectedStationId } = lighting;
	return stationsOnLines(model).map((stationId) => {
		const station = model.stations[stationId];
		const place = layout.places[stationId];
		return {
			id: stationId,
			name: station.name,
			description: station.description,
			kind: station.kind ?? StationKinds.task,
			state: station.state ?? StationStates.elsewhere,
			place,
			label: layout.labels[stationId],
			colour: colourOfStation(model, stationId),
			isShared: place.foot > place.top,
			isArrivedAt: arrivals.has(stationId),
			isGoingBack: goingBack.has(stationId),
			isSelected: stationId === selectedStationId,
			isDimmed: litStationIds !== undefined && !litStationIds.includes(stationId)
		};
	});
}
