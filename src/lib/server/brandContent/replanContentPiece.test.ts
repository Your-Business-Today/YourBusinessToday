import { describe, expect, it, vi } from 'vitest';
import { replanContentPiece } from './replanContentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./findContentPieceStage', () => ({ findContentPieceStage: async (_supabase: unknown, _organisationId: string, id: string) => stages[id] ?? null }));

const pieceIds = { idea: '0b7f3c2e-4a1d-4c55-9a0e-3f1e2d4c5b6a', scheduled: '1b7f3c2e-4a1d-4c55-9a0e-3f1e2d4c5b6a', published: '2b7f3c2e-4a1d-4c55-9a0e-3f1e2d4c5b6a' };
const stages: Record<string, string> = { [pieceIds.idea]: 'idea', [pieceIds.scheduled]: 'scheduled', [pieceIds.published]: 'published' };
const plannedFor = '2026-11-04T10:00:00.000Z';

function fakeSupabase(updates: Record<string, unknown>[]) {
	const query = { columns: {} as Record<string, unknown>, id: '', stages: [] as string[] };
	const chain = {
		update: (columns: Record<string, unknown>) => ((query.columns = columns), chain),
		eq: (column: string, value: string) => (column === 'id' && (query.id = value), chain),
		in: (_column: string, values: string[]) => ((query.stages = values), chain),
		select: async () => {
			const isMoved = query.stages.includes(stages[query.id]);
			if (isMoved) updates.push(query.columns);
			return { data: isMoved ? [{ id: query.id }] : [], error: null };
		}
	};
	return { from: () => chain } as unknown as SupabaseClient;
}

describe('moving a piece to another day', () => {
	it('moves only the planned day of a piece not yet scheduled', async () => {
		const updates: Record<string, unknown>[] = [];
		const outcome = await replanContentPiece(fakeSupabase(updates), { organisationId: 'jewel', contentPieceId: pieceIds.idea, plannedFor });
		expect(outcome).toBe('moved');
		expect(updates[0]).toMatchObject({ planned_for: plannedFor });
		expect(updates[0]).not.toHaveProperty('scheduled_for');
	});

	it('moves the scheduled day with it once the piece is scheduled', async () => {
		const updates: Record<string, unknown>[] = [];
		await replanContentPiece(fakeSupabase(updates), { organisationId: 'jewel', contentPieceId: pieceIds.scheduled, plannedFor });
		expect(updates[0]).toMatchObject({ planned_for: plannedFor, scheduled_for: plannedFor });
	});

	it('leaves a published piece on the day it went out, and finds no piece that is not there', async () => {
		const updates: Record<string, unknown>[] = [];
		const asked = { organisationId: 'jewel', plannedFor };
		expect(await replanContentPiece(fakeSupabase(updates), { ...asked, contentPieceId: pieceIds.published })).toBe('hasGoneOut');
		expect(await replanContentPiece(fakeSupabase(updates), { ...asked, contentPieceId: 'nope' })).toBe('noSuchPiece');
		expect(updates).toHaveLength(0);
	});
});
