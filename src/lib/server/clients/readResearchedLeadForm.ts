import { publicUrlOr } from './parsePublicUrl';
import { parseCompanyProfileForm } from './companyProfile';
import type { ResearchedPerson, ResearchedProfile } from './researchedProfile';

export type ReviewedLead = ResearchedProfile & { existingClientId: string | null };

export function readResearchedLeadForm(formData: FormData): ReviewedLead | null {
	const name = String(formData.get('name') ?? '').trim();
	if (name === '') return null;
	const existingClientId = String(formData.get('clientId') ?? '');
	return {
		existingClientId: existingClientId === '' ? null : existingClientId,
		name,
		website: String(formData.get('website') ?? '').trim(),
		profile: parseCompanyProfileForm(formData),
		people: readIncludedPeople(formData)
	};
}

function readIncludedPeople(formData: FormData): ResearchedPerson[] {
	const names = formData.getAll('personName').map(String);
	const roles = formData.getAll('personRole').map(String);
	const evidenceUrls = formData.getAll('personSourceUrl').map(String);
	const includedIndexes = formData.getAll('personIncluded').map(Number);
	return includedIndexes
		.map((index) => ({
			name: (names[index] ?? '').trim(),
			role: (roles[index] ?? '').trim(),
			evidenceUrl: publicUrlOr(evidenceUrls[index], '')
		}))
		.filter((person) => person.name !== '');
}
