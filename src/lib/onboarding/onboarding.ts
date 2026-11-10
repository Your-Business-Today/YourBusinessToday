import { companyDetails } from '$lib/data/companyDetails';
import { portalPersonLimits } from '$lib/portal/portalPerson';

export const onboardingProjectName = 'Onboarding';
export const onboardingProjectDescription =
	'Where a new client’s Claude maps their business with us, from their first prompt to the services we build.';

/** One of the first people an administrator sets a client up with. */
export type SetUpPerson = { name: string; email: string };

/** How many people one set-up takes, and the longest each value may be: the form shows them, and the site refuses anything else. */
export const clientSetUpLimits = {
	mostPeople: 10,
	nameLength: portalPersonLimits.nameLength,
	emailLength: portalPersonLimits.emailLength
} as const;

/** The fields of the set-up form on a client's page: the people ticked on its list, and one new person. */
export const setUpFormFields = {
	chosenContact: 'contactId',
	newPersonName: 'newPersonName',
	newPersonEmail: 'newPersonEmail'
} as const;

/** Where a client's Claude reaches Your Business Today, written out the same for everyone. */
export const publicConnectorAddress = `https://www.${companyDetails.websiteHost}/api/mcp`;

/**
 * The one prompt every client runs, the same for everyone and every run: the steps come from Your Business
 * Today's context run, so they can be improved without sending anyone a new prompt.
 */
export const companyContextPrompt = [
	'Run my company context with Your Business Today.',
	'',
	`Use the Your Business Today connector: ${publicConnectorAddress}`,
	"If its tools aren't in this chat, stop and tell me. I need to connect it first.",
	'',
	'Then follow what Your Business Today tells you. Read what it already holds',
	"about my company, go through every other connector I've switched on here,",
	'read only, and ask me only for what is still missing. Ask me before anything',
	'is written to Your Business Today.'
].join('\n');
