import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessBrainActions } from './businessBrainActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { nothingNewToFile, noSuchSource } from './businessBrainAnswers';
import type { McpCaller } from '../resolveMcpCaller';

const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	pageAlreadyFiled: null as { pageId: string; title: string } | null,
	sourceFound: 'source-1' as string | null,
	fileSource: vi.fn(),
	filePage: vi.fn(),
	revisePage: vi.fn()
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/businessBrain/ensureBusinessBrainPart', () => ({ ensureBusinessBrainPart: async () => 'part-1' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainSource', () => ({
	fileBusinessBrainSource: (...given: unknown[]) => brain.fileSource(...given) ?? Promise.resolve(brain.sourceFound)
}));
vi.mock('$lib/server/businessBrain/fileBusinessBrainPage', () => ({
	findBusinessBrainPage: async () => brain.pageAlreadyFiled,
	fileBusinessBrainPage: (...given: unknown[]) => brain.filePage(...given) ?? Promise.resolve({ isNew: true, pageId: 'page-1' })
}));
vi.mock('$lib/server/businessBrain/reviseBusinessBrainPage', () => ({
	readBusinessBrainPage: async () => ({ pageId: 'page-1', sourceId: null, kind: 'rule', title: 'Opening hours', summary: '', body: 'Nine to five.', facts: {}, updatedAt: 'then' }),
	reviseBusinessBrainPage: (...given: unknown[]) => brain.revisePage(...given) ?? Promise.resolve(true)
}));

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;
const [filePageAction, fileRevisionAction] = businessBrainActions;
const aPage = { organisationId: 'jewel', part: 'process', kind: 'rule', title: 'Opening hours', body: 'Eight to six.', sourceTitle: 'Staff handbook' };
const aRevision = { organisationId: 'jewel', pageId: '00000000-0000-0000-0000-00000000000a', title: 'Opening hours', body: 'Eight to six.', sourceTitle: 'Staff handbook' };

describe('filing into Your Business Brain', () => {
	beforeEach(() => {
		brain.switchedOn = ['business_brain'];
		brain.pageAlreadyFiled = null;
		brain.sourceFound = 'source-1';
		vi.clearAllMocks();
	});

	it('is refused while Your Business Brain is off for the organisation', async () => {
		brain.switchedOn = ['books'];
		expect(await filePageAction.run(nigelOnJewel, aPage)).toBe(moduleNotSwitchedOn('business_brain'));
		expect(brain.filePage).not.toHaveBeenCalled();
	});

	it('files a new page and gives back its id and its source id', async () => {
		const answer = await filePageAction.run(nigelOnJewel, aPage);
		expect(answer).toContain('Filed "Opening hours" in Jewel Enterprises\'s Your Business Brain, under Process.');
		expect(answer).toContain('Page id: page-1. Source id: source-1');
	});

	it('files no second page on a subject already filed, and keeps no source for it', async () => {
		brain.pageAlreadyFiled = { pageId: 'page-0', title: 'Opening hours' };
		expect(await filePageAction.run(nigelOnJewel, aPage)).toContain('file_business_brain_page_revision');
		expect(brain.fileSource).not.toHaveBeenCalled();
		expect(brain.filePage).not.toHaveBeenCalled();
	});

	it('refuses an earlier source that is not this organisation’s', async () => {
		brain.sourceFound = null;
		const { sourceTitle: _title, ...unsourced } = aPage;
		const fromElsewhere = { ...unsourced, sourceId: '00000000-0000-0000-0000-00000000000c' };
		expect(await filePageAction.run(nigelOnJewel, fromElsewhere)).toBe(noSuchSource);
		expect(brain.filePage).not.toHaveBeenCalled();
	});

	it('files a revision, keeping the earlier version in the history', async () => {
		expect(await fileRevisionAction.run(nigelOnJewel, aRevision)).toContain('the earlier version is kept');
		expect(brain.revisePage).toHaveBeenCalledOnce();
	});

	it('files nothing when the revision reads as the page already does', async () => {
		expect(await fileRevisionAction.run(nigelOnJewel, { ...aRevision, body: 'Nine to five.' })).toBe(nothingNewToFile);
		expect(brain.fileSource).not.toHaveBeenCalled();
		expect(brain.revisePage).not.toHaveBeenCalled();
	});
});
