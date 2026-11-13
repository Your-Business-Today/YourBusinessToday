import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveStaffMember } from './resolveStaffMember';

const nigelWithNoDisplayName = { id: 'nigel', email: 'nigel.reilly@jewelenterprises.co.uk', display_name: '' };
const james = { id: 'james', email: 'james@yourbusiness.today', display_name: 'James Beadle' };
const nigelAsNamed = { id: 'nigel', name: 'Nigel Reilly', email: nigelWithNoDisplayName.email };

function staffDirectoryHolding(rows: Record<string, unknown>[]): SupabaseClient {
	const rpc = async () => ({ data: rows, error: null });
	return { rpc } as unknown as SupabaseClient;
}

describe('resolveStaffMember', () => {
	const supabase = staffDirectoryHolding([nigelWithNoDisplayName, james]);

	it('finds a staff member with no display name by their first name', async () => {
		expect(await resolveStaffMember(supabase, 'Nigel', 'james')).toEqual(nigelAsNamed);
	});

	it('finds a staff member with no display name by their whole name', async () => {
		expect(await resolveStaffMember(supabase, 'Nigel Reilly', 'james')).toEqual(nigelAsNamed);
	});

	it('still finds a staff member with no display name by their email', async () => {
		expect(await resolveStaffMember(supabase, nigelWithNoDisplayName.email, 'james')).toEqual(nigelAsNamed);
	});

	it('names a staff member by their display name when they have one', async () => {
		const found = await resolveStaffMember(supabase, '', 'james');
		expect(found?.name).toBe('James Beadle');
	});
});
