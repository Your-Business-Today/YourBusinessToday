import type { LineColour } from './layout/lineMapModel';

export const lineStrokeClasses: Record<LineColour, string> = {
	sky: 'stroke-sky',
	lilac: 'stroke-lilac',
	teal: 'stroke-teal',
	peach: 'stroke-peach',
	rose: 'stroke-rose',
	daylight: 'stroke-daylight'
};

export const lineFillClasses: Record<LineColour, string> = {
	sky: 'fill-sky',
	lilac: 'fill-lilac',
	teal: 'fill-teal',
	peach: 'fill-peach',
	rose: 'fill-rose',
	daylight: 'fill-daylight'
};
