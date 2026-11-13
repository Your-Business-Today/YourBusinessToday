import { LabelSides, StationKinds, StationStates, type StationState } from './layout/lineMapModel';
import type { Point } from './layout/lineMapGeometry';
import { LabelFonts } from './layout/textMeasure';
import type { DrawnStation } from './drawnStations';

export const MarkKinds = { shared: 'shared', output: 'output', arrival: 'arrival', ...StationStates } as const;
export type MarkKind = (typeof MarkKinds)[keyof typeof MarkKinds];

const stateWords: Record<StationState, string> = {
	ours: 'done in one of our products',
	planned: 'planned',
	elsewhere: 'still done elsewhere'
};

const ChoosingKeys = ['Enter', ' '];
const markOffset = 13;
const RingRadii = { output: 19, other: 15 } as const;

export function markKindOf(station: DrawnStation): MarkKind {
	if (station.isShared) return MarkKinds.shared;
	if (station.kind === StationKinds.output) return MarkKinds.output;
	if (station.isArrivedAt) return MarkKinds.arrival;
	return station.state;
}

export function stationDescription(station: DrawnStation): string {
	if (station.description !== undefined) return station.description;
	const isOutput = station.kind === StationKinds.output;
	const output = isOutput ? ', an output the business runs on' : '';
	const goingBack = station.isGoingBack ? ', hands back to an earlier station' : '';
	return `${station.name}: ${stateWords[station.state]}${output}${goingBack}`;
}

export function isChoosingKey(event: KeyboardEvent): boolean {
	return ChoosingKeys.includes(event.key);
}

export function goingBackMarkAt(station: DrawnStation): Point {
	const { place, label } = station;
	const isLabelAbove = label.side === LabelSides.above;
	return { x: place.x + markOffset, y: isLabelAbove ? place.foot + markOffset : place.top - markOffset };
}

export function labelLineY(station: DrawnStation, index: number): number {
	const { station: font } = LabelFonts;
	const { label } = station;
	return label.y + font.baseline + index * font.lineHeight;
}

export function focusRingRadius(station: DrawnStation): number {
	return station.kind === StationKinds.output ? RingRadii.output : RingRadii.other;
}

export function labelClassesOf(station: DrawnStation): string {
	if (station.isSelected) return 'font-semibold fill-chalk';
	return station.isDimmed ? 'font-medium fill-chalk-faint' : 'font-medium fill-chalk-muted';
}
