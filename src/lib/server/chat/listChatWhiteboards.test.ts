import { describe, expect, it, vi } from 'vitest';
import { listWhiteboardsOfRoom } from './listChatWhiteboards';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./nameChatWhiteboards', () => ({ nameWhiteboards: async (boards: object[]) => boards.map((board) => ({ ...board, lastSavedByName: 'Sam' })) }));

function readerGetting(answer: { data: unknown; error: unknown }) {
	const query = { select: () => query, eq: () => query, order: () => query, limit: async () => answer };
	return { from: () => query } as unknown as SupabaseClient;
}

const row = { id: 'w1', room_id: 'finance', title: 'Plan', last_saved_by_account_id: 'sam', created_by_account_id: 'james', created_at: 'c', updated_at: 'u' };

describe('listWhiteboardsOfRoom', () => {
	it('lists the room’s boards with who saved each last', async () => {
		expect(await listWhiteboardsOfRoom(readerGetting({ data: [row], error: null }), 'finance')).toEqual([
			{ id: 'w1', roomId: 'finance', title: 'Plan', lastSavedByAccountId: 'sam', createdByAccountId: 'james', createdAt: 'c', updatedAt: 'u', lastSavedByName: 'Sam' }
		]);
	});

	it('answers none while migration 0278 has not run, since the room asks on every visit', async () => {
		const missing = { code: '42P01', message: 'relation "public.chat_whiteboards" does not exist' };
		expect(await listWhiteboardsOfRoom(readerGetting({ data: null, error: missing }), 'finance')).toEqual([]);
	});
});
