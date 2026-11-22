import { currentTermsVersion } from '$lib/data/termsVersion';

export const acceptanceFields = {
	hasAgreed: 'hasAgreed',
	termsVersion: 'termsVersion'
} as const;

const checkedBoxValue = 'on';

export const acceptanceProblems = {
	notAgreed: 'Tick the box to say you accept the terms. The site cannot be used until you do.',
	versionChanged:
		'The terms changed while this page was open. Read the version below and accept it.'
} as const;

/** What is wrong with an acceptance as sent, or null when it accepts the terms in force. */
export function problemWithAcceptance(formData: FormData): string | null {
	const agreement = formData.get(acceptanceFields.hasAgreed);
	if (agreement !== checkedBoxValue) return acceptanceProblems.notAgreed;
	const acceptedVersion = formData.get(acceptanceFields.termsVersion);
	if (acceptedVersion !== currentTermsVersion) return acceptanceProblems.versionChanged;
	return null;
}
