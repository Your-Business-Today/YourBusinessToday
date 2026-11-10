import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { runContentAction } from './brandContentTestWorld';
import { moduleNotSwitchedOn } from '../organisationModuleGate';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ switchedOn: [] as string[], stageAsked: null as unknown, otherChannels: [] as unknown[] }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandContent/findContentPieces', async () => {
	const { contentSummary } = await import('./brandContentFixtures');
	const findContentPieces = async (_supabase: unknown, _organisationId: string, stage: unknown) => {
		world.stageAsked = stage;
		return [contentSummary];
	};
	return { findContentPieces };
});
vi.mock('$lib/server/brandContent/findContentPiece', async () => {
	const { contentPiece } = await import('./brandContentFixtures');
	const found = { piece: contentPiece, reviews: [] };
	return {
		findContentPiece: async (_supabase: unknown, _organisationId: string, id: string) => (id === contentPiece.id ? found : null)
	};
});

vi.mock('$lib/server/brandContent/findPostPictures', () => ({ findPostPictures: async () => new Map() }));
vi.mock('$lib/server/brandContent/findContentPost', () => ({
	findContentPost: async (_supabase: unknown, _organisationId: string, piece: { id: string }) => ({
		id: piece.id,
		channels: [piece, ...world.otherChannels],
		isKept: true
	})
}));

const anotherPieceId = '1b7f3c2e-4a1d-4c55-9a0e-3f1e2d4c5b6a';

describe('listing and reading a brand’s content', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.otherChannels = [];
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		expect(await runContentAction('list_content', {})).toBe(moduleNotSwitchedOn('brand'));
	});

	it('lists the pieces at one stage', async () => {
		const listing = await runContentAction('list_content', { stage: 'drafted' });
		expect(listing).toBe(`- [drafted] Fire doors @ video.short.tiktok (id ${contentPieceId})`);
		expect(world.stageAsked).toBe('drafted');
	});

	it('lists every piece when no stage is given, and refuses a stage there is not', async () => {
		await runContentAction('list_content', {});
		expect(world.stageAsked).toBeNull();
		expect(await runContentAction('list_content', { stage: 'binned' })).toContain('stage is one of idea, drafted');
	});

	it('reads one piece whole, with its storyboard, its brand and its reviews', async () => {
		const answer = await runContentAction('read_content', { contentPieceId });
		expect(answer).toContain('1. (3s) A door closes');
		expect(answer).toContain('No reviews yet.');
		expect(answer).toContain('Brand as it held when drafted:\nBrand brief: Jewel');
	});

	it('says when the brand holds no piece of that id', async () => {
		expect(await runContentAction('read_content', { contentPieceId: anotherPieceId })).toContain('No piece of that id');
	});

	it('reads a post with every channel it goes out on, each with its own caption and stage', async () => {
		const { contentPiece } = await import('./brandContentFixtures');
		const facebook = { ...contentPiece, id: anotherPieceId, mediumPath: 'image.post.facebook', stage: 'approved', caption: 'Fitted: jewel.example' };
		world.otherChannels = [facebook];
		const answer = await runContentAction('read_content', { contentPieceId });
		expect(answer).toContain('The post goes out on 2 channels');
		expect(answer).toContain(`- [drafted] video.short.tiktok (id ${contentPieceId}) — this one — caption: Plainly`);
		expect(answer).toContain(`- [approved] image.post.facebook (id ${anotherPieceId}) — caption: Fitted: jewel.example`);
	});

	it('says a post on one channel can go out on another', async () => {
		expect(await runContentAction('read_content', { contentPieceId })).toContain('add_content_channel sends it out on another');
	});
});
