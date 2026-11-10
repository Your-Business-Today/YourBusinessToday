import { beforeEach, describe, expect, it, vi } from 'vitest';
import { brandKitWriteActions } from './brandKitWriteActions';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ switchedOn: [] as string[], summary: null as string | null, kept: [] as unknown[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandKits/loadBrandKit', () => ({ loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: [] }) }));
vi.mock('$lib/server/brandKits/keepBrandSummary', () => ({
	findBrandSummary: async () => world.summary,
	keepBrandSummary: async () => (world.summary === null ? { isNew: true } : { isNew: false, earlierSummary: world.summary })
}));
vi.mock('$lib/server/brandKits/keepBrandTrait', () => ({ keepBrandTrait: async () => true }));
vi.mock('$lib/server/brandKits/keepBrandDecision', () => ({
	keepBrandDecision: async (_supabase: unknown, keeping: unknown, decision: unknown) =>
		`decision-${world.kept.push({ keeping, decision })}`
}));

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

function run(name: string, input: Record<string, unknown>) {
	const action = brandKitWriteActions.find((candidate) => candidate.name === name)!;
	return action.run(nigelOnJewel, { organisationId: 'jewel', ...input }).then(String);
}

describe('setting an organisation’s brand kit', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.summary = 'Fire safety, plainly said';
		world.kept = [];
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		expect(await run('describe_brand', { summary: 'Plain' })).toBe(moduleNotSwitchedOn('brand'));
	});

	it('gives an organisation with no brand one when it is described', async () => {
		world.summary = null;
		expect(await run('describe_brand', { summary: 'Fire safety' })).toContain('Jewel Enterprises now has a brand: Fire safety');
	});

	it('says what the brand read before when it is described again', async () => {
		expect(await run('describe_brand', { summary: 'New words' })).toContain('It read: Fire safety, plainly said');
	});

	it('refuses a summary longer than its column holds', async () => {
		expect(await run('describe_brand', { summary: 'x'.repeat(1001) })).toContain('keep it to 1000');
	});

	it('asks for the brand to be described before a trait is defined', async () => {
		world.summary = null;
		const input = { facet: 'look', name: 'colour.seasonal', kind: 'colour', label: 'Seasonal colour' };
		expect(await run('define_brand_trait', input)).toContain('Say what it is first with describe_brand');
	});

	it('defines a trait of the brand’s own', async () => {
		const input = { facet: 'look', name: 'colour.seasonal', kind: 'colour', label: 'Seasonal colour' };
		expect(await run('define_brand_trait', input)).toContain('look.colour.seasonal [colour] is now a trait');
	});

	it('refuses choices that are not a list of words', async () => {
		const input = { facet: 'look', name: 'shape.style', kind: 'choice', label: 'Style', choices: 'round' };
		expect(await run('define_brand_trait', input)).toBe('The trait was not defined: choices is a list of words.');
	});

	it('keeps every decision that fits and refuses the one that does not, by name', async () => {
		const decisions = [
			{ traitKey: 'look.colour.accent', medium: 'all', value: '#FF5A36' },
			{ traitKey: 'look.colour.accent', medium: 'all', value: 'orange' },
			{ traitKey: 'voice.tone', medium: 'all', value: 'warm and plain' }
		];
		const answer = await run('record_brand_decisions', { status: 'proposed', decisions });
		expect(answer).toContain('Recorded 2 of 3 decisions in Jewel Enterprises’s brand kit as proposed.');
		expect(answer).toContain('- Decision 2 (look.colour.accent @ all): Accent colour');
		expect(world.kept).toHaveLength(2);
	});

	it('refuses a status other than proposed or adopted, recording nothing', async () => {
		const decisions = [{ traitKey: 'voice.tone', medium: 'all', value: 'warm' }];
		expect(await run('record_brand_decisions', { status: 'retired', decisions })).toContain('Nothing was recorded');
		expect(world.kept).toHaveLength(0);
	});
});
