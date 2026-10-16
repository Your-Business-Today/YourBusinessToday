import { describe, expect, it } from 'vitest';
import { onboardingSignUpLimits } from '$lib/onboarding/onboarding';
import { inputValues } from '$lib/server/portal/portalFormReading';
import { validateOnboardingSignUp } from './validateOnboardingSignUp';

describe('the business and person a visitor types to sign up', () => {
	it('signs up with both names, trimmed', () => {
		const typed = inputValues({ businessName: ' Acme Joinery ', personName: ' Sam Smith ' });
		expect(validateOnboardingSignUp(typed)).toEqual({
			businessName: 'Acme Joinery',
			personName: 'Sam Smith'
		});
	});

	it('is refused without a business name', () => {
		const typed = inputValues({ businessName: ' ', personName: 'Sam Smith' });
		expect(validateOnboardingSignUp(typed)).toEqual({ refusal: 'Give your business’s name.' });
	});

	it('is refused without the person’s name', () => {
		const typed = inputValues({ businessName: 'Acme Joinery', personName: '' });
		expect(validateOnboardingSignUp(typed)).toEqual({ refusal: 'Give your name.' });
	});

	it('refuses a business name longer than its column, rather than cutting it', () => {
		const businessName = 'A'.repeat(onboardingSignUpLimits.businessNameLength + 1);
		const typed = inputValues({ businessName, personName: 'Sam Smith' });
		expect(validateOnboardingSignUp(typed)).toHaveProperty('refusal');
	});

	it('refuses a person’s name longer than its column', () => {
		const personName = 'S'.repeat(onboardingSignUpLimits.personNameLength + 1);
		const typed = inputValues({ businessName: 'Acme Joinery', personName });
		expect(validateOnboardingSignUp(typed)).toHaveProperty('refusal');
	});
});
