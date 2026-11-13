import type { Box, LineMapGeometry, Point } from './lineMapGeometry';
import type { LabelSide, LineColour } from './lineMapModel';
import type { Columns } from './stationColumns';

export type StationPlace = Point & { top: number; foot: number };

export type HandoverBranch = { from: string; to: string; colour: LineColour; corners: Point[] };

export type LineRun = { lineId: string; name: string; colour: LineColour; y: number; from: number; to: number; nameEdge: number };

export type StationLabel = Box & { side: LabelSide; lines: string[] };

export type LineName = Box & { lineId: string; lines: string[]; right: number };

export type LinePlacement = {
	geometry: LineMapGeometry;
	laneOrder: string[];
	columns: Columns;
	places: Record<string, StationPlace>;
	branches: HandoverBranch[];
	lineRuns: LineRun[];
	width: number;
	height: number;
};

export type LineMapLayout = LinePlacement & {
	labels: Record<string, StationLabel>;
	lineNames: LineName[];
	goingBack: string[];
};
