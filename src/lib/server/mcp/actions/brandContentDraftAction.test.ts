import { beforeEach, describe, expect, it, vi } from 'vitest';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ switchedOn: [] as string[], summary: null as string | null, kept: [] as unknown[] }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({
	loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: [] })
}));
vi.mock('$lib/server/brandKits/keepBrandSummary', () => ({ findBrandSummary: async () => world.summary }));
vi.mock('$lib/server/brandContent/keepContentPiece', () => ({
	keepContentPiece: async (_supabase: unknown, piece: unknown) => `piece-${world.kept.push(piece)}`
}));

const tiktokDraft = { medium: 'video.short.tiktok', kind: 'before and after', title: 'Fire doors' };

describe('drafting a piece of a brand’s content', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.summary = 'Fire safety, plainly said';
		world.kept = [];
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		expect(await runContentAction('draft_content', tiktokDraft)).toBe(moduleNotSwitchedOn('brand'));
	});

	it('keeps the piece with a snapshot of the brand as it holds for the medium', async () => {
		const answer = await runContentAction('draft_content', { ...tiktokDraft, invitedAction: 'save' });
		expect(answer).toContain('Drafted “Fire doors”');
		expect(answer).toContain('(id piece-1)');
		const snapshot = { brief: expect.stringContaining('Jewel Enterprises') };
		expect(world.kept[0]).toMatchObject({ organisationId: 'jewel', accountId: 'nigel', kind: 'before and after', brandSnapshot: snapshot });
	});

	it('drafts a new piece only as a kind of post the brand keeps, the starter list while it keeps none', async () => {
		const answer = await runContentAction('draft_content', { ...tiktokDraft, kind: 'dish of the week' });
		expect(answer).toContain('The piece was not drafted: “dish of the week” is not a kind of post this brand keeps');
		expect(answer).toContain('the starter list (tip, showcase, before and after');
		expect(await runContentAction('draft_content', { ...tiktokDraft, kind: undefined })).toContain('kind is missing');
		expect(world.kept).toHaveLength(0);
	});

	it('refuses a piece that does not fit by name, keeping nothing', async () => {
		const answer = await runContentAction('draft_content', { ...tiktokDraft, title: 'x'.repeat(161) });
		expect(answer).toBe('The piece was not drafted: title is 161 characters; keep it to 160. Nothing was kept.');
		expect(world.kept).toHaveLength(0);
	});

	it('asks for the brand to be described before anything is drafted', async () => {
		world.summary = null;
		expect(await runContentAction('draft_content', tiktokDraft)).toContain('describe_brand');
		expect(world.kept).toHaveLength(0);
	});
});
