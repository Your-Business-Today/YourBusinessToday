import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adoptedDecision } from '$lib/brand/testing/decisionFixture';
import { brandKitReadActions } from './brandKitReadActions';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
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

const nigelOnTheProducts = {
	accountId: 'nigel',
	isStaff: false,
	ownedProjectIds: [] as string[],
	memberProjectIds: ['jewel-boats', 'other-site'],
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

const readBrand = brandKitReadActions.find((action) => action.name === 'read_brand')!;

vi.mock('$lib/server/projects/getProject', () => ({
	getProject: async (_supabase: unknown, projectId: string) =>
		({
			'jewel-boats': { id: 'jewel-boats', name: 'Jewel Boats', organisationId: 'jewel' },
			'other-site': { id: 'other-site', name: 'Another website', organisationId: 'another' }
		})[projectId] ?? null
}));

describe('reading a product’s own brand kit', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		const decisions = [adoptedDecision('voice.tone', 'all', 'warm and plain')];
		world.kit = { catalogue: builtInTraits, decisions } satisfies BrandKit;
	});

	it('names the product as the brand, read over its organisation’s', async () => {
		const input = { organisationId: 'jewel', projectId: 'jewel-boats' };
		const answer = String(await readBrand.run(nigelOnTheProducts, input));
		expect(answer).toContain('Jewel Boats: 1 decisions in force or proposed');
	});

	it('refuses a project of another organisation, and one the caller is not on', async () => {
		const refusal = /No project you are on belongs to Jewel Enterprises/;
		expect(String(await readBrand.run(nigelOnTheProducts, { organisationId: 'jewel', projectId: 'other-site' }))).toMatch(refusal);
		expect(String(await readBrand.run(nigelOnTheProducts, { organisationId: 'jewel', projectId: 'elsewhere' }))).toMatch(refusal);
	});
});
