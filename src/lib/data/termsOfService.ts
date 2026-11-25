import { termsAccountSections } from './legal/termsAccountSections';
import { termsEngagementSections } from './legal/termsEngagementSections';
import { termsGeneralSections } from './legal/termsGeneralSections';
import { termsSoftwareSections } from './legal/termsSoftwareSections';
import { termsVersionPublishedOn } from './termsVersion';
import type { LegalDocument } from './legalDocument';

export const termsOfService: LegalDocument = {
	title: 'Terms of service',
	metaDescription:
		'The terms that govern this website and the Your Business Today client portal — who it is for, that what it generates is produced by software and is not professional advice, how it sits under your written agreement, who owns what we build, confidentiality, and the rest of the small print.',
	lastUpdatedOn: termsVersionPublishedOn,
	sections: [
		...termsAccountSections,
		...termsSoftwareSections,
		...termsEngagementSections,
		...termsGeneralSections
	]
};
