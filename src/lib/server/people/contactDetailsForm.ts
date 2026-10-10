export type ContactDetails = { name: string; email: string; phone: string };

export function readContactDetails(formData: FormData): ContactDetails | null {
	const name = String(formData.get('name') ?? '').trim();
	if (name === '') return null;
	return {
		name,
		email: String(formData.get('email') ?? '').trim().toLowerCase(),
		phone: String(formData.get('phone') ?? '').trim()
	};
}
