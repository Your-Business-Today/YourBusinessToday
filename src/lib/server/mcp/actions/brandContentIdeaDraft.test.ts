import { beforeEach, describe, expect, it, vi } from 'vitest';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { contentPieceId } from './brandContentFixtures';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ stage: 'idea' as string | null, writtenUp: [] as unknown[], kept: [] as unknown[] }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async () => jewel };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['brand'] }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({ loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: [] }) }));
vi.mock('$lib/server/brandKits/keepBrandSummary', () => ({ findBrandSummary: async () => 'Fire safety, plainly said' }));
vi.mock('$lib/server/brandContent/keepContentPiece', async (importOriginal) => ({
	...(await importOriginal<object>()),
	keepContentPiece: async (_supabase: unknown, piece: unknown) => `piece-${world.kept.push(piece)}`
}));
vi.mock('$lib/server/brandContent/keepDraftOnIdea', () => ({
	keepDraftOnIdea: async (_supabase: unknown, idea: unknown) => world.stage === 'idea' && world.writtenUp.push(idea) > 0
}));
vi.mock('$lib/server/brandContent/findContentPieceStage', () => ({ findContentPieceStage: async () => world.stage }));

const draft = { medium: 'image.post.facebook', title: 'Fire doors', script: 'A door closes.', contentPieceId };

describe('writing up an idea already on the plan', () => {
	beforeEach(() => Object.assign(world, { stage: 'idea', writtenUp: [], kept: [] }));

	it('writes the draft onto the idea, so it keeps its day, rather than starting a new piece', async () => {
		expect(await runContentAction('draft_content', draft)).toContain('Wrote up the idea as “Fire doors”');
		expect(world.writtenUp[0]).toMatchObject({ organisationId: 'jewel', contentPieceId, draft: { script: 'A door closes.' } });
		expect(world.kept).toHaveLength(0);
	});

	it('writes up only an idea, and says when the piece is not there', async () => {
		world.stage = 'drafted';
		expect(await runContentAction('draft_content', draft)).toContain('Only an idea is written up as a draft, and this one is at drafted');
		world.stage = null;
		expect(await runContentAction('draft_content', draft)).toContain('No piece of that id');
		expect(await runContentAction('draft_content', { ...draft, contentPieceId: 'nope' })).toContain('No piece of that id');
		expect(world.writtenUp).toHaveLength(0);
	});
});
