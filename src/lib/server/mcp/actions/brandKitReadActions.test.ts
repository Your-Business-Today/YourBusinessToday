import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adoptedDecision } from '$lib/brand/testing/decisionFixture';
import { brandKitReadActions } from './brandKitReadActions';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { BrandKit } from '$lib/server/brandKits/loadBrandKit';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ switchedOn: [] as string[], kit: { catalogue: [], decisions: [] } as unknown }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({ loadBrandKit: async () => world.kit }));

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

function actionNamed(name: string) {
	return brandKitReadActions.find((action) => action.name === name)!;
}

function kitOf(decisions: BrandKit['decisions']): BrandKit {
	return { catalogue: builtInTraits, decisions };
}

describe('reading an organisation’s brand kit', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.kit = kitOf([]);
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		expect(await actionNamed('read_brand').run(nigelOnJewel, { organisationId: 'jewel' })).toBe(moduleNotSwitchedOn('brand'));
	});

	it('reads an organisation with nothing decided as an empty kit, naming its gaps', async () => {
		const answer = String(await actionNamed('read_brand').run(nigelOnJewel, { organisationId: 'jewel' }));
		expect(answer).toContain('Jewel Enterprises has nothing decided yet, so its brand kit is empty.');
		expect(answer).toContain('Not yet decided anywhere:');
		expect(answer).toContain('voice.tone');
	});

	it('lists every decision in force or proposed', async () => {
		world.kit = kitOf([adoptedDecision('voice.tone', 'all', 'warm and plain')]);
		const answer = String(await actionNamed('read_brand').run(nigelOnJewel, { organisationId: 'jewel' }));
		expect(answer).toContain('[adopted] voice.tone @ all = warm and plain');
		expect(answer).not.toContain('voice.tone,');
	});

	it('resolves the brand for one medium as a brief with its style variables', async () => {
		world.kit = kitOf([adoptedDecision('look.shape.borderWidth', 'all', '2px')]);
		const input = { organisationId: 'jewel', medium: 'video.short.reels' };
		const answer = String(await actionNamed('resolve_brand').run(nigelOnJewel, input));
		expect(answer).toContain('Brand brief: Jewel Enterprises, for Instagram Reels');
		expect(answer).toContain('"--brand-shape-border-width": "2px"');
	});

	it('refuses a medium the catalogue does not have', async () => {
		const input = { organisationId: 'jewel', medium: 'carrier.pigeon' };
		const answer = String(await actionNamed('resolve_brand').run(nigelOnJewel, input));
		expect(answer).toBe('carrier.pigeon is not a medium. Call read_brand_catalogue for the mediums.');
	});

	it('names every medium in the catalogue', async () => {
		const answer = String(await actionNamed('read_brand_catalogue').run(nigelOnJewel, { organisationId: 'jewel' }));
		expect(answer).toContain('- video.short.tiktok');
	});
});
