import { privacyCollectionSections } from './legal/privacyCollectionSections';
import { privacyProcessorSections } from './legal/privacyProcessorSections';
import { privacyRightsSections } from './legal/privacyRightsSections';
import { privacySecuritySections } from './legal/privacySecuritySections';
import { privacySharingSections } from './legal/privacySharingSections';
import type { LegalDocument } from './legalDocument';

export const privacyStatement: LegalDocument = {
	title: 'Privacy statement',
	metaDescription:
		'How Your Business Today collects, uses, protects and deletes your information — across the consultancy and the client portal — and the promise we make about what we learn about your business.',
	lastUpdatedOn: '16 November 2026',
	sections: [
		...privacyCollectionSections,
		...privacyProcessorSections,
		...privacySharingSections,
		...privacySecuritySections,
		...privacyRightsSections
	]
};
