import { validateHeadcountBand } from '$lib/data/headcountBands';
import { validatePublicUrl } from './parsePublicUrl';

/** Why the company profile form cannot be saved as sent, or null when its band and source page fit. */
export function validateCompanyProfileForm(formData: FormData): string | null {
	const bandRefusal = validateHeadcountBand(formData.get('headcountBand'));
	if (bandRefusal !== null) return bandRefusal;
	return validatePublicUrl('source page', formData.get('sourceUrl'));
}
