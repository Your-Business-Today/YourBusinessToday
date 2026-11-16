import { companyInformationSections } from './legal/companyInformationSections';
import type { LegalDocument } from './legalDocument';

export const companyInformation: LegalDocument = {
	title: 'Company information',
	metaDescription:
		'Who Your Business Today Ltd is: company number, registered office, insurance, data protection registration, terms and governing law.',
	lastUpdatedOn: '16 November 2026',
	sections: companyInformationSections
};
