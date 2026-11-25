import { textField } from '../actionTypes';

const slugList = (description: string) => ({ type: 'array', items: { type: 'string' }, description });

/** The fields of the contract pack actions, described once for both. */
export const contractPackFields = {
	organisationId: textField("The client organisation's id, as list_organisations gives it"),
	packId: textField('A pack id, as read_contract_pack gives it; leave out for the latest pack'),
	documents: slugList(
		'The contract documents in the pack, by slug, in the order they are read; leave out for all of them (list_client_documents)'
	),
	clauses: slugList(
		'The optional clauses chosen, by slug; leave out for the ones chosen unless left out (read_client_document lists each)'
	),
	values: {
		type: 'object',
		additionalProperties: { type: 'string' },
		description:
			'Blanks written into the pack, each label as it stands in its brackets with the text it is filled with, such as ' +
			'{"Order number": "YBT-0001", "Start date": "1 December 2026"}. A value given here wins over the organisation\'s ' +
			"details and the quote. Any blank still unknown stays in its brackets, to be filled later."
	}
};
