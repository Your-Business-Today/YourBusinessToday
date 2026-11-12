import { detailKinds, type DetailGroupOf } from './organisationDetailField';

/**
 * The party the contract and every invoice name. The Master Services Agreement states the client's legal name,
 * company number, where it is registered and its registered office; an invoice must carry the customer's name
 * (VAT Regulations 1995, regulation 14), and its VAT number is the evidence that a customer outside the UK is
 * in business (VAT Notice 741A).
 */
export const companyDetails = {
	key: 'company',
	title: 'Company',
	fields: [
		{
			key: 'legalName',
			column: 'legal_name',
			label: 'Legal name',
			longest: 160,
			kind: detailKinds.line,
			meaning: 'Its registered name, as the contract and every invoice name it'
		},
		{
			key: 'companyNumber',
			column: 'company_number',
			label: 'Company number',
			longest: 30,
			kind: detailKinds.line,
			meaning: 'Its number at Companies House, or on the register of the country it is registered in'
		},
		{
			key: 'registeredIn',
			column: 'registered_in',
			label: 'Registered in',
			longest: 60,
			kind: detailKinds.line,
			meaning: 'The country it is registered in, such as England and Wales'
		},
		{
			key: 'vatNumber',
			column: 'vat_number',
			label: 'VAT number',
			longest: 20,
			kind: detailKinds.line,
			meaning: 'Its VAT registration number, if it has one'
		},
		{
			key: 'registeredOffice',
			column: 'registered_office',
			label: 'Registered office',
			longest: 500,
			kind: detailKinds.lines,
			meaning: 'Its registered office address, as the contract states it'
		}
	]
} as const satisfies DetailGroupOf<string>;
