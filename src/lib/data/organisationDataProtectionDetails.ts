import { detailKinds, type DetailGroupOf } from './organisationDetailField';

/**
 * The controller we process personal data for. Our record of processing names each controller's contact and,
 * where it has one, its representative and its data protection officer (UK GDPR, Article 30(2)); a personal
 * data breach is told to the controller without undue delay (Article 33(2)), by phone and in writing.
 */
export const dataProtectionDetails = {
	key: 'dataProtection',
	title: 'Data protection',
	fields: [
		{
			key: 'dataContactName',
			column: 'data_contact_name',
			label: 'Data protection contact',
			longest: 120,
			kind: detailKinds.line,
			meaning: 'Who answers for the personal data we process for it, and who we tell of a breach'
		},
		{
			key: 'dataContactEmail',
			column: 'data_contact_email',
			label: 'Data protection email',
			longest: 254,
			kind: detailKinds.email,
			meaning: 'Where a personal data breach is reported in writing'
		},
		{
			key: 'dataContactPhone',
			column: 'data_contact_phone',
			label: 'Data protection phone',
			longest: 40,
			kind: detailKinds.line,
			meaning: 'The number we ring about a personal data breach'
		},
		{
			key: 'dataProtectionOfficer',
			column: 'data_protection_officer',
			label: 'Representative or DPO',
			longest: 300,
			kind: detailKinds.line,
			meaning: 'Its UK representative or data protection officer, with how to reach them, if it has one'
		}
	]
} as const satisfies DetailGroupOf<string>;
