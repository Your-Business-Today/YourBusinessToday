import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adoptedDecision } from '$lib/brand/testing/decisionFixture';
import { brandSheetAction, notAProjectOf } from './brandSheetAction';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ switchedOn: [] as string[], decisions: [] as unknown[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({
	loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: world.decisions })
}));
vi.mock('$lib/server/projects/getProject', () => ({
	getProject: async (_supabase: unknown, projectId: string) =>
		({
			'jewel-site': { id: 'jewel-site', name: 'Jewel website', organisationId: 'jewel' },
			'other-site': { id: 'other-site', name: 'Another website', organisationId: 'another' }
		})[projectId] ?? null
}));

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	ownedProjectIds: [] as string[],
	memberProjectIds: ['jewel-site', 'other-site'],
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

describe('reading a project’s brand sheet', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.decisions = [adoptedDecision('look.colour.accent', 'web', '#e63946')];
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		const input = { organisationId: 'jewel', projectId: 'jewel-site' };
		expect(await brandSheetAction.run(nigelOnJewel, input)).toBe(moduleNotSwitchedOn('brand'));
	});

	it('writes the sheet from the organisation’s kit as it holds for the website', async () => {
		const sheet = String(await brandSheetAction.run(nigelOnJewel, { organisationId: 'jewel', projectId: 'jewel-site' }));
		expect(sheet.startsWith('# Brand\n\nSources: Jewel Enterprises\'s brand kit')).toBe(true);
		expect(sheet).toContain('Website (web.site), for Jewel website');
		expect(sheet).toContain('| `--brand-colour-accent` | Accent colour · #e63946 |');
	});

	it('refuses a project of another organisation, and one the caller is not on', async () => {
		const refusal = notAProjectOf('Jewel Enterprises');
		expect(await brandSheetAction.run(nigelOnJewel, { organisationId: 'jewel', projectId: 'other-site' })).toBe(refusal);
		expect(await brandSheetAction.run(nigelOnJewel, { organisationId: 'jewel', projectId: 'elsewhere' })).toBe(refusal);
	});
});
