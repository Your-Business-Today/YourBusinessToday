import { beforeEach, describe, expect, it, vi } from 'vitest';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { contentPiece, contentPieceId } from './brandContentFixtures';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ stage: 'idea' as string | null, redrafted: [] as unknown[], kept: [] as unknown[] }));
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
vi.mock('$lib/server/brandContent/findContentPiece', () => ({
	findContentPiece: async () => (world.stage === null ? null : { piece: { ...contentPiece, stage: world.stage }, reviews: [] })
}));
vi.mock('$lib/server/brandContent/keepDraftOnPiece', () => ({
	keepDraftOnPiece: async (_supabase: unknown, piece: unknown) => ['idea', 'drafted'].includes(world.stage!) && world.redrafted.push(piece) > 0
}));
vi.mock('$lib/server/brandContent/findContentPieceStage', () => ({ findContentPieceStage: async () => world.stage }));

const changes = { contentPieceId, caption: 'Shut it behind you' };

describe('drafting a piece already on the plan again', () => {
	beforeEach(() => Object.assign(world, { stage: 'idea', redrafted: [], kept: [] }));

	it('writes an idea up on its planned day, rather than starting a new piece', async () => {
		const answer = await runContentAction('draft_content', { ...changes, script: 'A door closes.' });
		expect(answer).toContain('Wrote up the idea as “Fire doors”');
		expect(world.redrafted[0]).toMatchObject({ organisationId: 'jewel', contentPieceId, kind: null });
		expect(world.kept).toHaveLength(0);
	});

	it('changes a drafted piece with what is given and keeps what is left out', async () => {
		world.stage = 'drafted';
		expect(await runContentAction('draft_content', changes)).toContain('Changed “Fire doors”');
		const draft = { title: 'Fire doors', hook: 'Hear that?', caption: 'Shut it behind you', medium: { path: 'video.short.tiktok' } };
		expect(world.redrafted[0]).toMatchObject({ kind: null, draft });
	});

	it('keeps the piece’s kind unless another the brand keeps is given', async () => {
		await runContentAction('draft_content', { ...changes, kind: 'Review' });
		expect(world.redrafted[0]).toMatchObject({ kind: 'review' });
		expect(await runContentAction('draft_content', { ...changes, kind: 'dish of the week' })).toContain('is not a kind of post this brand keeps');
		expect(world.redrafted).toHaveLength(1);
	});

	it('keeps a drafted piece on its medium and checks every value it is given', async () => {
		world.stage = 'drafted';
		expect(await runContentAction('draft_content', { ...changes, medium: 'text.email' })).toContain('a drafted piece keeps its medium');
		expect(await runContentAction('draft_content', { ...changes, title: 'x'.repeat(1000) })).toContain('title is 1000 characters');
		expect(world.redrafted).toHaveLength(0);
	});

	it('refuses a piece past drafted by name, with the way round', async () => {
		world.stage = 'awaiting_approval';
		expect(await runContentAction('draft_content', changes)).toContain('Ask for changes with review_content');
		world.stage = 'published';
		expect(await runContentAction('draft_content', changes)).toContain('this one is at published');
		expect(world.redrafted).toHaveLength(0);
	});

	it('says when the piece is not there', async () => {
		world.stage = null;
		expect(await runContentAction('draft_content', changes)).toContain('No piece of that id');
		expect(await runContentAction('draft_content', { ...changes, contentPieceId: 'nope' })).toContain('No piece of that id');
	});
});
