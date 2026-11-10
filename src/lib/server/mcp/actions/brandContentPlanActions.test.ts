import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adoptedDecision } from '$lib/brand/testing/decisionFixture';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { brandContentPlanActions } from './brandContentPlanActions';
import { contentPieceId } from './brandContentFixtures';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({
	switchedOn: [] as string[],
	summary: null as string | null,
	ideas: [] as unknown[],
	bounds: null as unknown,
	replanned: [] as unknown[],
	replanOutcome: 'moved',
	decisions: [] as unknown[]
}));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({ loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: world.decisions }) }));
vi.mock('$lib/server/brandKits/keepBrandSummary', () => ({ findBrandSummary: async () => world.summary }));
vi.mock('$lib/server/brandContent/keepContentIdea', () => ({
	keepContentIdea: async (_supabase: unknown, idea: unknown) => `idea-${world.ideas.push(idea)}`
}));
vi.mock('$lib/server/brandContent/replanContentPiece', () => ({
	replanContentPiece: async (_supabase: unknown, piece: unknown) => (world.replanned.push(piece), world.replanOutcome)
}));
vi.mock('$lib/server/brandContent/findPostPictures', () => ({ findPostPictures: async () => new Map() }));
vi.mock('$lib/server/brandContent/findPlannedPieces', () => ({
	findPlannedPieces: async (_supabase: unknown, _organisationId: string, bounds: unknown) => {
		world.bounds = bounds;
		const plannedFor = '2026-11-03T09:00:00Z';
		return [{ id: 'piece-1', postId: 'piece-1', mediumPath: 'image.post.facebook', kind: 'tip', title: 'Fire doors', hook: 'Hear that?', stage: 'idea', plannedFor, scheduledFor: null, updatedAt: '' }];
	}
}));

const idea = { medium: 'image.post.facebook', kind: 'Tip', title: 'Fire doors', hook: 'Hear that?', plannedFor: '2026-11-03T09:00:00Z' };

describe('the month’s plan over the connector', () => {
	beforeEach(() => {
		Object.assign(world, { switchedOn: ['brand'], summary: 'Fire safety, plainly said', ideas: [], replanned: [], replanOutcome: 'moved', decisions: [] });
	});

	it('builds every action with the one module rule, and refuses while Brand is off', async () => {
		expect(brandContentPlanActions.every(isGatedByModuleRule)).toBe(true);
		world.switchedOn = [];
		expect(await runContentAction('read_content_plan', {})).toBe(moduleNotSwitchedOn('brand'));
	});

	it('reads a month week by week, with its counts and the days that have nothing on them', async () => {
		const plan = await runContentAction('read_content_plan', { month: '2026-11' });
		expect(plan).toContain('Jewel Enterprises’s plan for November 2026: 1 planned, 0 scheduled, 0 published, 1 still to do.');
		expect(plan).toContain('1 still to do. Times are on the UK clock.\n\nKinds of post: tip 1.');
		expect(plan).toContain('Week of Mon 2 Nov\n- Mon 2 Nov: nothing planned\n- Tue 3 Nov 09:00 [idea] Fire doors (tip) @ image.post.facebook — “Hear that?” (id piece-1)');
		expect(world.bounds).toEqual({ startsAt: '2026-11-01T00:00:00.000Z', endsAt: '2026-12-01T00:00:00.000Z' });
		expect(await runContentAction('read_content_plan', { month: 'Nov' })).toContain('month is a year and a month as YYYY-MM');
	});

	it('plans an idea for a day at idea, and refuses one that does not fit, keeping nothing', async () => {
		expect(await runContentAction('plan_content_idea', idea)).toContain('Planned the idea “Fire doors” (tip) for Facebook image post on 2026-11-03T09:00:00.000Z');
		expect(world.ideas[0]).toMatchObject({ organisationId: 'jewel', accountId: 'nigel', kind: 'tip', idea: { plannedFor: '2026-11-03T09:00:00.000Z' } });
		expect(await runContentAction('plan_content_idea', { ...idea, plannedFor: '3 Nov' })).toContain('plannedFor is an ISO');
		world.summary = null;
		expect(await runContentAction('plan_content_idea', idea)).toContain('has no brand yet');
		expect(world.ideas).toHaveLength(1);
	});

	it('plans an idea only as one of the brand’s kinds of post, refusing any other by name', async () => {
		world.decisions = [adoptedDecision('voice.postKinds', 'all', ['patient story', 'meet the team'])];
		expect(await runContentAction('plan_content_idea', { ...idea, kind: 'Patient Story' })).toContain('(patient story)');
		const refusal = await runContentAction('plan_content_idea', idea);
		expect(refusal).toBe(
			'The idea was not planned: “Tip” is not a kind of post this brand keeps: give one of patient story, meet the team. Nothing was kept.'
		);
		expect(await runContentAction('plan_content_idea', { ...idea, kind: undefined })).toContain('kind is missing');
		expect(world.ideas).toHaveLength(1);
	});

	it('moves a piece to another day, and says when it is published or not there', async () => {
		const move = { contentPieceId, plannedFor: '2026-11-04T10:00:00+00:00' };
		expect(await runContentAction('move_content_to_day', move)).toContain('now goes out at 2026-11-04T10:00:00.000Z');
		expect(world.replanned[0]).toEqual({ organisationId: 'jewel', contentPieceId, plannedFor: '2026-11-04T10:00:00.000Z' });
		world.replanOutcome = 'hasGoneOut';
		expect(await runContentAction('move_content_to_day', move)).toContain('it is published');
		world.replanOutcome = 'noSuchPiece';
		expect(await runContentAction('move_content_to_day', move)).toContain('No piece of that id');
		expect(await runContentAction('move_content_to_day', { ...move, plannedFor: 'soon' })).toContain('Nothing was changed');
		expect(world.replanned).toHaveLength(3);
	});
});
