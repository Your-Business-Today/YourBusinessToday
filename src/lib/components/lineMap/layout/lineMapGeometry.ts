export type Point = { x: number; y: number };
export type Box = Point & { width: number; height: number };

export type LineMapGeometry = {
	pitch: number;
	left: number;
	top: number;
	right: number;
	bottom: number;
	stroke: number;
	widestRow: number;
};

export const defaultGeometry: LineMapGeometry = { pitch: 92, left: 140, top: 62, right: 56, bottom: 54, stroke: 6, widestRow: 1280 };

export const LabelSpacing = {
	stationReach: 14,
	outputReach: 19,
	labelGap: 6,
	forkClearance: 7,
	nameForkClearance: 3,
	boxClearance: 4,
	lineClearance: 5,
	lineNameGap: 26,
	arrivingLineNameGap: 12,
	lineNameInset: 34,
	pointStep: 3
} as const;
