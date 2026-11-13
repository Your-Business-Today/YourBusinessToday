import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';

/** A role's colour as a swatch beside its name, matching the line it is drawn as. */
export const lineSwatchClasses: Record<LineColour, string> = {
	sky: 'bg-sky',
	lilac: 'bg-lilac',
	teal: 'bg-teal',
	peach: 'bg-peach',
	rose: 'bg-rose',
	daylight: 'bg-daylight'
};
