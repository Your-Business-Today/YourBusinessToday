import { longestOrganisationName } from '$lib/data/organisationRules';
import { portalPersonLimits } from '$lib/portal/portalPerson';

export const onboardingStartPath = '/start';
export const onboardingProjectName = 'Onboarding';
export const onboardingProjectDescription =
	'Where a new client’s Claude maps their business with us, from their first prompt to the services we build.';

/** The longest each value a visitor types to sign up may be: the form shows them, and the site refuses anything longer. */
export const onboardingSignUpLimits = {
	businessNameLength: longestOrganisationName,
	personNameLength: portalPersonLimits.nameLength
} as const;

export const onboardingPrompt =
	'Use the Your Business Today connector. Open my Onboarding project and start my onboarding: map how my business works from my other connectors, and ask me before you write anything to Your Business Today.';

export type OnboardingSignUp = { businessName: string; personName: string };
