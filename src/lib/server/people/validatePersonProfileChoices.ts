import { validateSeniority, validateWarmth } from '$lib/data/contactProfileFields';

/** Why the person's seniority or warmth cannot be saved as sent, or null when both are among their choices. */
export function validatePersonProfileChoices(formData: FormData): string | null {
	return validateSeniority(formData.get('seniority')) ?? validateWarmth(formData.get('warmth'));
}
