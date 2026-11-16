import { describeEmailOwners } from './describeEmailOwners';
import { emailAddressLimits, readEmailAddressList } from '$lib/data/emailAddressList';
import { findRecordsForEmail } from '$lib/server/filedEmails/findRecordsForEmail';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const addressesField = 'addresses';

export const emailOwnerActions: McpAction[] = [
	{
		name: 'find_records_for_email',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'who the addresses of one email belong to: a person on the People register and the clients or leads they are a contact at, a client whose website the address comes from, us, or nobody we hold',
		guidance:
			'Give the from, to and cc of one email. Each address is answered on its own line, with the client and person ids to file the email under. ' +
			'A person held by the address comes first; failing that, a client whose website is at the address’s domain; an address at a free mail service such as gmail.com never matches a website. ' +
			'An address of our own is answered as us. Nobody we hold means the sender may be a new lead: never guess a client for them.',
		inputSchema: objectSchema(
			{
				[addressesField]: {
					type: 'array',
					items: { type: 'string', maxLength: emailAddressLimits.longestAddress },
					minItems: 1,
					maxItems: emailAddressLimits.mostAddresses,
					description: `The email addresses of one email, at most ${emailAddressLimits.mostAddresses}`
				}
			},
			[addressesField]
		),
		run: async (caller, input) => {
			const list = readEmailAddressList(addressesField, input[addressesField]);
			if ('refusal' in list) return list.refusal;
			return describeEmailOwners(await findRecordsForEmail(caller.supabase, list.addresses));
		}
	}
];
