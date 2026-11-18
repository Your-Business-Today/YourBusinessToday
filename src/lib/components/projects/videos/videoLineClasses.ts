import type { LineColour } from '$lib/projectVideos/videoSections';

/** The classes a section's line is drawn with, written out whole so Tailwind keeps them. */
export type LineClasses = { rail: string; text: string; ring: string };

export const videoLineClasses: Record<LineColour, LineClasses> = {
	sky: { rail: 'bg-sky', text: 'text-sky', ring: 'border-sky' },
	lilac: { rail: 'bg-lilac', text: 'text-lilac', ring: 'border-lilac' },
	teal: { rail: 'bg-teal', text: 'text-teal', ring: 'border-teal' },
	peach: { rail: 'bg-peach', text: 'text-peach', ring: 'border-peach' },
	rose: { rail: 'bg-rose', text: 'text-rose', ring: 'border-rose' },
	daylight: { rail: 'bg-daylight', text: 'text-daylight', ring: 'border-daylight' }
};
