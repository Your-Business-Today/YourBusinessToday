import { termsAccountSections } from './legal/termsAccountSections';
import { termsEngagementSections } from './legal/termsEngagementSections';
import { termsGeneralSections } from './legal/termsGeneralSections';
import type { LegalDocument } from './legalDocument';

export const termsOfService: LegalDocument = {
	title: 'Terms of service',
	metaDescription:
		'The terms that govern this website and the Your Business Today client portal — who it is for, how it sits under your written agreement, what we build for you, confidentiality, and the rest of the small print.',
	lastUpdatedOn: '10 November 2026',
	sections: [...termsAccountSections, ...termsEngagementSections, ...termsGeneralSections]
};
