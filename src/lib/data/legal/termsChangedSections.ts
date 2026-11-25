import type { LegalSection } from '$lib/data/legalDocument';
import { termsOfService } from '$lib/data/termsOfService';

/** The headings of the sections that changed in the version in force, since the version of 25 November 2026. */
export const termsChangedHeadings: readonly string[] = [
	'Who this is for',
	'Your written agreement comes first',
	'Software, not professional advice',
	'You check what is generated',
	'What we build for you',
	'Your data',
	'Connecting your own tools',
	'Chatbots onto Your Business Brain',
	'AI-generated output',
	'Acceptable use',
	'Availability and changes',
	'Ending access',
	'Our liability',
	'Events outside our control',
	'General'
];

/** The sections the acceptance page shows: those changed in the version in force, in the order the full terms give them. */
export const termsChangedSections: LegalSection[] = termsOfService.sections.filter((section) =>
	termsChangedHeadings.includes(section.heading)
);
