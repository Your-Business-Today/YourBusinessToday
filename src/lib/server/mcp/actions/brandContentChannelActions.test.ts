import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adoptedDecision } from '$lib/brand/testing/decisionFixture';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { contentPieceId } from './brandContentFixtures';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({
	switchedOn: [] as string[],
	decisions: [] as unknown[],
	otherChannels: [] as unknown[],
	kept: [] as Record<string, unknown>[]
}));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({ loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: world.decisions }) }));
vi.mock('$lib/server/brandContent/findContentPiece', async () => {
	const { contentPiece } = await import('./brandContentFixtures');
	const found = { piece: contentPiece, reviews: [] };
	return { findContentPiece: async (_supabase: unknown, _organisationId: string, id: string) => (id === contentPiece.id ? found : null) };
});
vi.mock('$lib/server/brandContent/findContentPost', () => ({
	findContentPost: async (_supabase: unknown, _organisationId: string, piece: { id: string }) => ({
		id: piece.id,
		channels: [piece, ...world.otherChannels],
		isKept: world.otherChannels.length > 0
	})
}));
vi.mock('$lib/server/brandContent/keepPostChannel', () => ({
	keepPostChannel: async (_supabase: unknown, channel: Record<string, unknown>) => `channel-${world.kept.push(channel)}`
}));

const instagram = { contentPieceId, medium: 'image.post.instagram', caption: 'Fire doors, fitted. Link in bio. #firesafety #doors #london' };
const instagramKit = [
	adoptedDecision('voice.fewestHashtags', 'image.post.instagram', 3),
	adoptedDecision('voice.mostHashtags', 'image.post.instagram', 5),
	adoptedDecision('voice.linkPlacement', 'image.post.instagram', 'in the bio')
];

describe('sending a post out on one more channel', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.decisions = instagramKit;
		world.otherChannels = [];
		world.kept = [];
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		expect(await runContentAction('add_content_channel', instagram)).toBe(moduleNotSwitchedOn('brand'));
	});

	it('keeps the channel on the post with its own caption, the post’s action and the brand as it holds there', async () => {
		const answer = await runContentAction('add_content_channel', instagram);
		expect(answer).toContain('Added Instagram post to the post “Fire doors”, which now goes out on 2 channels (id channel-1)');
		const [kept] = world.kept;
		expect(kept).toMatchObject({ organisationId: 'jewel', accountId: 'nigel', caption: instagram.caption, invitedAction: 'save' });
		expect(kept.post).toMatchObject({ id: contentPieceId, isKept: false });
		expect(kept.brandSnapshot).toMatchObject({ brief: expect.stringContaining('Jewel Enterprises') });
	});

	it('refuses a caption the kit’s decisions at the channel do not allow, by name, keeping nothing', async () => {
		const tooFew = await runContentAction('add_content_channel', { ...instagram, caption: 'Fitted. #doors' });
		expect(tooFew).toContain('the brand puts at least 3 on Instagram post (voice.fewestHashtags). Nothing was kept.');
		const withAddress = await runContentAction('add_content_channel', { ...instagram, caption: 'https://jewel.example #a #b #c' });
		expect(withAddress).toContain('the link in the bio (voice.linkPlacement)');
		expect(world.kept).toHaveLength(0);
	});

	it('refuses a channel the post already goes out on, and a medium there is not', async () => {
		expect(await runContentAction('add_content_channel', { ...instagram, medium: 'video.short.tiktok' })).toContain(
			'the post already goes out on TikTok'
		);
		expect(await runContentAction('add_content_channel', { ...instagram, medium: 'smoke.signal' })).toContain('smoke.signal is not a medium');
		expect(world.kept).toHaveLength(0);
	});

	it('refuses an action the new channel does not allow, and a caption too long for its column', async () => {
		const email = await runContentAction('add_content_channel', { ...instagram, medium: 'text.email', caption: '' });
		expect(email).toContain('Email does not let people save');
		const tooLong = await runContentAction('add_content_channel', { ...instagram, caption: 'x'.repeat(2201) });
		expect(tooLong).toContain('caption is 2201 characters; keep it to 2200');
		expect(world.kept).toHaveLength(0);
	});

	it('says when the brand holds no piece of that id', async () => {
		const anotherPieceId = '1b7f3c2e-4a1d-4c55-9a0e-3f1e2d4c5b6a';
		expect(await runContentAction('add_content_channel', { ...instagram, contentPieceId: anotherPieceId })).toContain('No piece of that id');
	});
});
