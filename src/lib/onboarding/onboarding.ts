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

export const onboardingPrompt =
	'Use the Your Business Today connector. Open my Onboarding project and start my onboarding: map how my business works from my other connectors, and ask me before you write anything to Your Business Today.';
