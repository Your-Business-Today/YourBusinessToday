import { beforeEach, describe, expect, it, vi } from 'vitest';
import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { companyNameRefusals } from './validateCompanyName';
import { emptyCompanyProfile } from './companyProfile';

const doubles = vi.hoisted(() => ({ getClient: vi.fn(), renameClient: vi.fn(), updateCompanyProfile: vi.fn() }));

vi.mock('./getClient', () => ({ getClient: doubles.getClient }));
vi.mock('./renameClient', () => ({ renameClient: doubles.renameClient }));
vi.mock('./updateCompanyProfile', () => ({ updateCompanyProfile: doubles.updateCompanyProfile }));

const { noSuchCompany, saveCompanyProfileForm } = await import('./saveCompanyProfileForm');

const supabase = {} as never;
const misspelt = { id: 'client-1', name: 'Coinbserve Aqua', website: '', profile: emptyCompanyProfile };

function profileFormNaming(name: string): FormData {
	const formData = new FormData();
	formData.set('name', name);
	formData.set('website', 'https://conservaqua.example');
	formData.set('industry', 'Water retail');
	return formData;
}

describe('saving the company page profile form', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.getClient.mockResolvedValue(misspelt);
	});

	it('corrects the name and saves the profile', async () => {
		expect(await saveCompanyProfileForm(supabase, 'client-1', profileFormNaming(' Conservaqua '), 'staff-1')).toBeNull();
		expect(doubles.renameClient).toHaveBeenCalledWith(supabase, misspelt, 'Conservaqua', 'staff-1');
		const profile = { ...emptyCompanyProfile, industry: 'Water retail' };
		expect(doubles.updateCompanyProfile).toHaveBeenCalledWith(supabase, 'client-1', 'https://conservaqua.example', profile);
	});

	it('refuses an empty name or one over the limit, and writes nothing', async () => {
		const tooLong = 'n'.repeat(companyResearchLimits.longestName + 1);
		expect(await saveCompanyProfileForm(supabase, 'client-1', profileFormNaming(''), 'staff-1')).toBe(companyNameRefusals.nameMissing);
		expect(await saveCompanyProfileForm(supabase, 'client-1', profileFormNaming(tooLong), 'staff-1')).toBe(companyNameRefusals.nameTooLong);
		expect(doubles.renameClient).not.toHaveBeenCalled();
		expect(doubles.updateCompanyProfile).not.toHaveBeenCalled();
	});

	it('refuses a company nobody has', async () => {
		doubles.getClient.mockResolvedValue(null);
		expect(await saveCompanyProfileForm(supabase, 'client-9', profileFormNaming('Conservaqua'), 'staff-1')).toBe(noSuchCompany);
		expect(doubles.updateCompanyProfile).not.toHaveBeenCalled();
	});
});
