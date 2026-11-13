export type LineColour = 'sky' | 'lilac' | 'teal' | 'peach' | 'rose' | 'daylight';
export type StationState = 'ours' | 'planned' | 'elsewhere';
export type StationKind = 'task' | 'output';
export type LabelSide = 'above' | 'below';

export const StationStates = { ours: 'ours', planned: 'planned', elsewhere: 'elsewhere' } as const;
export const StationKinds = { task: 'task', output: 'output' } as const;
export const LabelSides = { above: 'above', below: 'below' } as const;

export type MapStation = { name: string; kind?: StationKind; state?: StationState; labelSide?: LabelSide };
export type MapLine = { id: string; name: string; colour: LineColour; stops: string[] };
export type MapHandover = { from: string; to: string; failure?: string };

export type LineMapModel = {
	lines: MapLine[];
	stations: Record<string, MapStation>;
	handovers: MapHandover[];
};
