import { describe, expect, it, vi } from 'vitest';
import { findLatestSummaryOfRoom } from './findLatestChatSummary';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/accounts/getAccountsById', () => ({ getAccountsById: async () => [{ id: 'nigel', name: 'Nigel Smith' }] }));

const row = { id: 's1', room_id: 'finance', covers_up_to: '2026-11-22T09:15:00Z', words: 'Done.', written_by_account_id: 'nigel', written_via: 'claude', created_at: '2026-11-22T10:00:00Z' };

const lookingFor = vi.fn();

function answering(answer: { data: unknown; error: unknown }) {
	const query = { select: () => query, eq: (column: string, value: string) => lookingFor(column, value) ?? query, order: () => query, limit: () => query, maybeSingle: async () => answer };
	return { from: vi.fn(() => query) } as unknown as SupabaseClient;
}

describe('findLatestSummaryOfRoom', () => {
	it('gives the room’s latest catch-up with who wrote it', async () => {
		const supabase = answering({ data: row, error: null });
		expect(await findLatestSummaryOfRoom(supabase, 'finance')).toMatchObject({ id: 's1', words: 'Done.', writtenVia: 'claude', writerName: 'Nigel Smith' });
		expect(supabase.from).toHaveBeenCalledWith('chat_room_summaries');
		expect(lookingFor).toHaveBeenCalledWith('room_id', 'finance');
	});

	it('answers none when the room has no catch-up, and while migration 0276 has not run', async () => {
		expect(await findLatestSummaryOfRoom(answering({ data: null, error: null }), 'finance')).toBeNull();
		expect(await findLatestSummaryOfRoom(answering({ data: null, error: { code: '42P01' } }), 'finance')).toBeNull();
	});

	it('fails on any other failure, rather than hide it', async () => {
		await expect(findLatestSummaryOfRoom(answering({ data: null, error: { code: '57014' } }), 'finance')).rejects.toMatchObject({ code: '57014' });
	});
});
