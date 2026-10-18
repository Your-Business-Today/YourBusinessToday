import { validatePublicUrl } from './parsePublicUrl';
import { validateCompanyProfileForm } from './validateCompanyProfileForm';

/** Why the reviewed lead cannot be saved as sent, or null when its profile and each included person's evidence page fit. */
export function validateResearchedLeadForm(formData: FormData): string | null {
	const profileRefusal = validateCompanyProfileForm(formData);
	if (profileRefusal !== null) return profileRefusal;
	const evidenceUrls = formData.getAll('personSourceUrl');
	const includedIndexes = formData.getAll('personIncluded').map(Number);
	const evidenceRefusals = includedIndexes.map((index) => validatePublicUrl('evidence page', evidenceUrls[index]));
	return evidenceRefusals.find((refusal) => refusal !== null) ?? null;
}
