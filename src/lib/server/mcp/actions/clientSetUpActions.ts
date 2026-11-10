import { companyDetails } from '$lib/data/companyDetails';
import { describeClientSetUp } from '$lib/server/onboarding/describeClientSetUp';
import { isRefusal, type Refusal } from '$lib/server/portal/portalFormReading';
import { setClientUp } from '$lib/server/onboarding/setClientUp';
import { validateRecordId } from '$lib/data/isUuid';
import { nobodyToSetUp, validateSetUpPeople, validateSetUpPerson } from '$lib/server/onboarding/validateClientSetUp';
import { clientSetUpLimits, type SetUpPerson } from '$lib/onboarding/onboarding';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const personSchema = objectSchema(
	{
		name: textField(`Their full name, at most ${clientSetUpLimits.nameLength} characters`),
		email: textField('The email address their link goes to')
	},
	['name', 'email']
);

const peopleField = {
	type: 'array',
	items: personSchema,
	description: `The client's first people, at most ${clientSetUpLimits.mostPeople}; the first manages the organisation and administers its portal`
};

export const clientSetUpActions: McpAction[] = [
	{
		name: 'set_up_client',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'set a client already on the register up: its organisation, Onboarding project and first people, each sent one link',
		guidance:
			'Nobody signs themselves up: this is how a client starts. It works on the client already on the ' +
			'register and never makes a second one; a person already listed there is used as listed. Each person ' +
			'gets one email whose link signs them in and lands them on their company on the portal, with the steps ' +
			'to connect their Claude and the one prompt. Running it again makes nothing twice, but sends the links again.',
		inputSchema: objectSchema(
			{
				clientId: textField('The client id, as given by list_clients'),
				people: peopleField,
				origin: textField(`Where the links should point, defaulting to ${companyDetails.websiteUrl}`)
			},
			['clientId', 'people']
		),
		run: async (caller, input) => setUpClient(caller, input)
	}
];

async function setUpClient(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const refusal = validateRecordId('clientId', clientId);
	if (refusal !== null) return refusal;
	const people = validateSetUpPeople(readPeople(input.people));
	if (isRefusal(people)) return people.refusal;
	const origin = readOptionalText(input, 'origin') ?? companyDetails.websiteUrl;
	const setUp = await setClientUp({ clientId, people, origin, actorAccountId: caller.accountId });
	if (isRefusal(setUp)) return setUp.refusal;
	return describeClientSetUp(setUp);
}

function readPeople(people: unknown): (SetUpPerson | Refusal)[] {
	if (!Array.isArray(people)) return [nobodyToSetUp];
	return people.map(readPerson);
}

function readPerson(person: unknown): SetUpPerson | Refusal {
	const fields = (person ?? {}) as Record<string, unknown>;
	return validateSetUpPerson(readText(fields, 'name'), readText(fields, 'email'));
}
