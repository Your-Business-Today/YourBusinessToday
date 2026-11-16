import { beforeEach, describe, expect, it, vi } from 'vitest';
import { companyResearchLimits } from '$lib/data/companyResearchRules';

const doubles = vi.hoisted(() => ({ update: vi.fn(), matchingId: vi.fn(), recordClientEvent: vi.fn() }));

vi.mock('./recordClientEvent', () => ({ recordClientEvent: doubles.recordClientEvent }));

const { renameClient } = await import('./renameClient');
const { companyNameRefusals, validateCompanyName } = await import('./validateCompanyName');

const supabase = { from: () => ({ update: doubles.update }) } as never;
const misspelt = { id: 'client-1', name: 'Coinbserve Aqua' };

describe('correcting a company name on the register', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.update.mockReturnValue({ eq: doubles.matchingId });
		doubles.matchingId.mockResolvedValue({ error: null });
	});

	it('writes the new name and tells the history the old name and the new', async () => {
		expect(await renameClient(supabase, misspelt, 'Conservaqua', 'staff-1')).toBe(true);
		expect(doubles.update).toHaveBeenCalledWith({ name: 'Conservaqua' });
		expect(doubles.matchingId).toHaveBeenCalledWith('id', 'client-1');
		const detail = { from: 'Coinbserve Aqua', to: 'Conservaqua' };
		expect(doubles.recordClientEvent).toHaveBeenCalledWith(supabase, 'client-1', 'renamed', detail, 'staff-1');
	});

	it('writes nothing when the name has not changed', async () => {
		expect(await renameClient(supabase, misspelt, 'Coinbserve Aqua', 'staff-1')).toBe(false);
		expect(doubles.update).not.toHaveBeenCalled();
		expect(doubles.recordClientEvent).not.toHaveBeenCalled();
	});
});

describe('the name a company is held to', () => {
	it('takes a name with the space around it gone', () => {
		expect(validateCompanyName('  Conservaqua ')).toEqual({ name: 'Conservaqua' });
	});

	it('refuses an empty name', () => {
		expect(validateCompanyName('   ')).toBe(companyNameRefusals.nameMissing);
		expect(validateCompanyName(undefined)).toBe(companyNameRefusals.nameMissing);
	});

	it('refuses a name over the limit and takes one at it', () => {
		const longestName = 'n'.repeat(companyResearchLimits.longestName);
		expect(validateCompanyName(`${longestName}n`)).toBe(companyNameRefusals.nameTooLong);
		expect(validateCompanyName(longestName)).toEqual({ name: longestName });
	});
});
