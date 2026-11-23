import { beforeEach, describe, expect, it } from 'vitest';
import { closeChatDecision } from './closeChatDecision';
import { chatDecisionRefusals } from '$lib/data/chat/chatDecisionRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const decisionId = '22222222-2222-4222-8222-222222222222';
const openRow = {
	id: decisionId,
	room_id: 'finance',
	message_id: 'm1',
	wording: 'Take the Leeds job?',
	raised_by_account_id: 'james',
	raised_via: 'site',
	waiting_on_account_id: 'nigel',
	status: 'open',
	outcome: null,
	closed_by_account_id: null,
	closed_at: null,
	created_at: '2026-11-20T09:00:00Z'
};
const world = { stored: null as Record<string, unknown> | null, updates: [] as Record<string, unknown>[], isClosedMeanwhile: false };

function serviceRole() {
	const finding = { select: () => finding, eq: () => finding, maybeSingle: async () => ({ data: world.stored, error: null }) };
	const closing = (change: Record<string, unknown>) => {
		world.updates.push(change);
		const filtered = {
			eq: () => filtered,
			select: () => filtered,
			maybeSingle: async () => ({ data: world.isClosedMeanwhile ? null : { ...world.stored, ...change }, error: null })
		};
		return filtered;
	};
	return { from: () => ({ ...finding, update: closing }) } as unknown as SupabaseClient;
}

const nigelOnJewel = { organisationId: 'jewel', accountId: 'nigel' };
const close = (input: Record<string, unknown>) => closeChatDecision(serviceRole(), nigelOnJewel, input);

describe('closeChatDecision', () => {
	beforeEach(() => Object.assign(world, { stored: openRow, updates: [], isClosedMeanwhile: false }));

	it('closes an open decision with its outcome, by whoever closes it, at that moment', async () => {
		const closed = await close({ decisionId, outcome: ' We take it. ' });
		expect(world.updates).toHaveLength(1);
		expect(world.updates[0]).toMatchObject({ status: 'closed', outcome: 'We take it.', closed_by_account_id: 'nigel' });
		expect(Date.parse(world.updates[0].closed_at as string)).not.toBeNaN();
		expect(closed).toMatchObject({ status: 'closed', outcome: 'We take it.', closedByAccountId: 'nigel' });
	});

	it('refuses a decision the organisation does not have and one already closed, never reopening it', async () => {
		world.stored = null;
		expect(await close({ decisionId, outcome: 'Yes.' })).toBe(chatDecisionRefusals.noSuchDecision);
		world.stored = { ...openRow, status: 'closed', outcome: 'No.', closed_by_account_id: 'james', closed_at: '2026-11-21T09:00:00Z' };
		expect(await close({ decisionId, outcome: 'Yes.' })).toBe(chatDecisionRefusals.alreadyClosed);
		expect(world.updates).toEqual([]);
	});

	it('refuses when someone else closed it a moment before, and an outcome that does not fit', async () => {
		world.isClosedMeanwhile = true;
		expect(await close({ decisionId, outcome: 'Yes.' })).toBe(chatDecisionRefusals.alreadyClosed);
		expect(await close({ decisionId, outcome: '  ' })).toBe(chatDecisionRefusals.outcome);
	});
});
