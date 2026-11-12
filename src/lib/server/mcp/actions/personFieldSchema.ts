import { seniorityOrder, warmthOrder } from '$lib/data/contactProfileFields';
import { textField } from '../actionTypes';

const namedSeniorities = seniorityOrder.filter((seniority) => seniority !== '');

export const personIdField = textField('The person id, as list_people and read_client give it');

/** The fields of a person on the People register, as add_person and update_person take them. */
export const personFields = {
	name: textField('Their full name'),
	email: textField('Their email address, if you have it'),
	phone: textField('Their phone number, if you have it'),
	seniority: textField(`Their seniority: ${namedSeniorities.join(', ')}`),
	isDecisionMaker: { type: 'boolean', description: 'Whether they decide whether to buy' },
	warmth: textField(`How warm they are to us: ${warmthOrder.join(', ')}`),
	lastContactedOn: textField('The day we last spoke to them, YYYY-MM-DD'),
	nextAction: textField('What we do next with them, such as "Call after the trade show"'),
	nextActionDue: textField('The day the next action is due, YYYY-MM-DD')
};

export const newPersonFields = {
	name: personFields.name,
	email: personFields.email,
	phone: personFields.phone,
	seniority: personFields.seniority
};
