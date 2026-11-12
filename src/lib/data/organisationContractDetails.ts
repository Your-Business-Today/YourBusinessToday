import { detailKinds, type DetailGroupOf } from './organisationDetailField';

/**
 * Who binds the client and where it is told things. The Master Services Agreement's signature block names
 * the signatory, their position and the email that notices under the agreement are sent to; the Order Form
 * names the contact who can decide.
 */
export const contractDetails = {
	key: 'contract',
	title: 'Contract',
	fields: [
		{
			key: 'signatoryName',
			column: 'signatory_name',
			label: 'Signatory',
			longest: 120,
			kind: detailKinds.line,
			meaning: 'Who signs the contract for it, and can decide for it'
		},
		{
			key: 'signatoryPosition',
			column: 'signatory_position',
			label: 'Signatory’s position',
			longest: 120,
			kind: detailKinds.line,
			meaning: 'The signatory’s position, as the signature block states it'
		},
		{
			key: 'signatoryEmail',
			column: 'signatory_email',
			label: 'Signatory’s email',
			longest: 254,
			kind: detailKinds.email,
			meaning: 'Where the contract is sent to be signed'
		},
		{
			key: 'noticesEmail',
			column: 'notices_email',
			label: 'Notices email',
			longest: 254,
			kind: detailKinds.email,
			meaning: 'Where formal notices under the contract are sent'
		}
	]
} as const satisfies DetailGroupOf<string>;
