import { describe, expect, it } from 'vitest';
import { currentTermsVersion } from '$lib/data/termsVersion';
import { acceptanceProblems, problemWithAcceptance } from './readAcceptanceForm';

function acceptanceForm(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return formData;
}

describe('problemWithAcceptance', () => {
	it('takes a ticked box for the terms in force', () => {
		const form = acceptanceForm({ hasAgreed: 'on', termsVersion: currentTermsVersion });
		expect(problemWithAcceptance(form)).toBeNull();
	});

	it('refuses an acceptance whose box was not ticked', () => {
		const form = acceptanceForm({ termsVersion: currentTermsVersion });
		expect(problemWithAcceptance(form)).toBe(acceptanceProblems.notAgreed);
	});

	it('refuses an acceptance of a version that is no longer in force', () => {
		const form = acceptanceForm({ hasAgreed: 'on', termsVersion: '2026-11-13' });
		expect(problemWithAcceptance(form)).toBe(acceptanceProblems.versionChanged);
	});
});
