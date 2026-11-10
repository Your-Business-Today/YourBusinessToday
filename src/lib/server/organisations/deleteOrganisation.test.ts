import { describe, expect, it } from 'vitest';
import { deleteOrganisation } from './deleteOrganisation';
import type { SupabaseClient } from '@supabase/supabase-js';

const organisationId = 'organisation-1';
const foreignKeyViolation = { code: '23503', message: 'still referenced from table "business_brains"' };
const connectionLost = { code: '08006', message: 'connection lost' };

function databaseAnswering(failure: { code: string; message: string } | null): SupabaseClient {
	const deletion = { eq: async () => ({ error: failure }) };
	return { from: () => ({ delete: () => deletion }) } as unknown as SupabaseClient;
}

describe('deleteOrganisation', () => {
	it('answers null once the organisation is deleted', async () => {
		const refusal = await deleteOrganisation(databaseAnswering(null), organisationId);
		expect(refusal).toBeNull();
	});

	it('answers why when the organisation still holds its Your Business Brain', async () => {
		const refusal = await deleteOrganisation(databaseAnswering(foreignKeyViolation), organisationId);
		expect(refusal).toContain('Your Business Brain');
	});

	it('throws any other failure', async () => {
		const deletion = deleteOrganisation(databaseAnswering(connectionLost), organisationId);
		await expect(deletion).rejects.toEqual(connectionLost);
	});
});
