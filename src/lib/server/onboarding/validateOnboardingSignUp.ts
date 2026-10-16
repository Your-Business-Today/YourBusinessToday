import { onboardingSignUpLimits, type OnboardingSignUp } from '$lib/onboarding/onboarding';
import { tooLong, type Refusal, type ValueReader } from '$lib/server/portal/portalFormReading';

/** The business and the person a visitor typed in to sign up, or why they cannot sign up as typed. */
export function validateOnboardingSignUp(read: ValueReader): OnboardingSignUp | Refusal {
	const businessName = read('businessName');
	const personName = read('personName');
	if (businessName === '') return { refusal: 'Give your business’s name.' };
	if (businessName.length > onboardingSignUpLimits.businessNameLength)
		return tooLong('The business name', onboardingSignUpLimits.businessNameLength);
	if (personName === '') return { refusal: 'Give your name.' };
	if (personName.length > onboardingSignUpLimits.personNameLength)
		return tooLong('Your name', onboardingSignUpLimits.personNameLength);
	return { businessName, personName };
}
