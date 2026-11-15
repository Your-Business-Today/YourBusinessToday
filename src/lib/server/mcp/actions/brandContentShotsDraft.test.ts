import { beforeEach, describe, expect, it, vi } from 'vitest';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const clipId = '11111111-2222-4333-8444-555555555555';
const musicId = '66666666-7777-4888-9999-000000000000';
const world = vi.hoisted(() => ({ items: new Map<string, unknown>(), kept: [] as unknown[] }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async () => jewel };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['brand'] }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({ loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: [] }) }));
vi.mock('$lib/server/brandKits/keepBrandSummary', () => ({ findBrandSummary: async () => 'Fire safety, plainly said' }));
vi.mock('$lib/server/brandLibrary/findItemStandings', () => ({ findItemStandings: async () => world.items }));
vi.mock('$lib/server/brandContent/keepContentPiece', async (importOriginal) => ({
	...(await importOriginal<object>()),
	keepContentPiece: async (_supabase: unknown, piece: unknown) => `piece-${world.kept.push(piece)}`
}));

const arrived = { posting: 'nothing_recognisable', recordedAt: '2026-11-04T09:30:00Z', shows: 'A door' };
const doorClip = { ...arrived, filename: 'door.mp4', mimeType: 'video/mp4' };
const theme = { ...arrived, filename: 'theme.mp3', mimeType: 'audio/mpeg' };
const shot = { description: 'A door closes', seconds: 3, onScreenText: 'Shut it', overline: 'Fire safety', wordsAt: 'left', clipItemId: clipId };
const film = { medium: 'video.short.tiktok', kind: 'tip', title: 'Fire doors', storyboard: [shot], musicItemId: musicId };

describe('making a video’s storyboard from the brand’s own library', () => {
	beforeEach(() => Object.assign(world, { items: new Map([[clipId, doorClip], [musicId, theme]]), kept: [] }));

	it('keeps each shot’s clip, its three lines and where they sit, and the piece’s music', async () => {
		expect(await runContentAction('draft_content', film)).toContain('Drafted “Fire doors”');
		const keptShot = { clipItemId: clipId, overline: 'Fire safety', onScreenText: 'Shut it', underline: '', wordsAt: 'left' };
		expect(world.kept[0]).toMatchObject({ draft: { storyboard: [keptShot], musicItemId: musicId } });
	});

	it('refuses by name an item not in the library, music as a clip and a clip as music', async () => {
		world.items = new Map([[musicId, theme]]);
		expect(await runContentAction('draft_content', film)).toContain('Shot 1: its clip is not in this brand’s library');
		world.items = new Map([[clipId, theme], [musicId, theme]]);
		expect(await runContentAction('draft_content', film)).toContain('Shot 1: theme.mp3 is music');
		world.items = new Map([[clipId, doorClip], [musicId, doorClip]]);
		expect(await runContentAction('draft_content', film)).toContain('door.mp4 is not music');
		expect(world.kept).toHaveLength(0);
	});

	it('refuses an item not to be posted, music on a piece that is not a video, and words past their limits', async () => {
		world.items = new Map([[clipId, { ...doorClip, posting: 'not_to_be_posted' }], [musicId, theme]]);
		expect(await runContentAction('draft_content', film)).toContain('marked not to be posted');
		const post = { ...film, medium: 'image.post.x', storyboard: [] };
		expect(await runContentAction('draft_content', post)).toContain('X image post is not a video, so it carries no music');
		const longLine = { ...film, storyboard: [{ ...shot, overline: 'x'.repeat(81) }] };
		expect(await runContentAction('draft_content', longLine)).toContain('Shot 1: overline is 81 characters; keep it to 80');
		const misplaced = { ...film, storyboard: [{ ...shot, wordsAt: 'middle' }] };
		expect(await runContentAction('draft_content', misplaced)).toContain('wordsAt is one of top, left, bottom');
		expect(world.kept).toHaveLength(0);
	});
});
