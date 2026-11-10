import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adoptBrandDecision, retireBrandDecision } from './brandDecisionStatusRuns';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const world = vi.hoisted(() => ({ status: 'proposed', changes: [] as string[] }));
const decisionId = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
vi.mock('$lib/server/brandKits/brandDecisionStatus', () => ({
	findBrandDecision: async (_supabase: unknown, _organisationId: string, id: string) =>
		id === decisionId ? { id, traitKey: 'voice.tone', mediumPath: 'all', status: world.status } : null,
	retireAdoptedAt: async () => world.changes.push('retired the adopted one'),
	changeDecisionStatus: async (_supabase: unknown, _decision: unknown, status: string) => {
		world.changes.push(`moved to ${status}`);
		return true;
	}
}));

const caller = { accountId: 'nigel' } as McpCaller;
const jewel = { id: 'jewel', name: 'Jewel Enterprises' } as Organisation;

describe('adopting and retiring a brand decision', () => {
	beforeEach(() => {
		world.status = 'proposed';
		world.changes = [];
	});

	it('retires the decision in force at the same place before adopting, deleting nothing', async () => {
		const answer = String(await adoptBrandDecision(caller, { decisionId }, jewel));
		expect(world.changes).toEqual(['retired the adopted one', 'moved to adopted']);
		expect(answer).toContain('is now adopted. It was proposed.');
	});

	it('leaves a decision already adopted as it is', async () => {
		world.status = 'adopted';
		expect(String(await adoptBrandDecision(caller, { decisionId }, jewel))).toContain('already adopted');
		expect(world.changes).toEqual([]);
	});

	it('retires a decision, keeping its row', async () => {
		world.status = 'adopted';
		expect(String(await retireBrandDecision(caller, { decisionId }, jewel))).toContain('is now retired');
		expect(world.changes).toEqual(['moved to retired']);
	});

	it('refuses an id that is not a decision id, and one the kit does not hold', async () => {
		expect(String(await retireBrandDecision(caller, { decisionId: 'tone' }, jewel))).toContain('must be an id');
		const elsewhere = { decisionId: '00000000-0000-4000-8000-000000000000' };
		expect(String(await retireBrandDecision(caller, elsewhere, jewel))).toContain('No decision of that id');
	});
});
