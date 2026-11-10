import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessBrainActions } from './businessBrainActions';
import { sourceFileIdsRefusal } from '$lib/data/businessBrainFileRules';
import type { McpCaller } from '../resolveMcpCaller';

const brain = vi.hoisted(() => ({
	arrivedFileIds: [] as string[],
	filePage: vi.fn(),
	nameFiles: vi.fn(),
	revisePage: vi.fn()
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async () => ({ id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/ensureBusinessBrainPart', () => ({ ensureBusinessBrainPart: async () => 'part-1' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainSource', () => ({ fileBusinessBrainSource: async () => 'source-1' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainPage', () => ({
	findBusinessBrainPage: async () => null,
	fileBusinessBrainPage: (...given: unknown[]) => brain.filePage(...given) ?? Promise.resolve({ isNew: true, pageId: 'page-1' })
}));
vi.mock('$lib/server/businessBrain/reviseBusinessBrainPage', () => ({
	readBusinessBrainPage: async () => ({ pageId: 'page-1', sourceId: null, kind: 'rule', title: 'Opening hours', summary: '', body: 'Nine to five.', facts: {}, updatedAt: 'then' }),
	reviseBusinessBrainPage: (...given: unknown[]) => brain.revisePage(...given) ?? Promise.resolve(true)
}));
vi.mock('$lib/server/businessBrain/findBusinessBrainFile', () => ({
	findArrivedBusinessBrainFileIds: async (_supabase: unknown, _organisationId: string, fileIds: string[]) =>
		fileIds.filter((fileId) => brain.arrivedFileIds.includes(fileId))
}));
vi.mock('$lib/server/businessBrain/nameBusinessBrainPageFiles', () => ({
	nameBusinessBrainPageFiles: (...given: unknown[]) => brain.nameFiles(...given) ?? Promise.resolve()
}));

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;
const [filePageAction, fileRevisionAction] = businessBrainActions;
const handbook = '00000000-0000-0000-0000-00000000000f';
const notSent = '00000000-0000-0000-0000-0000000000f2';
const aPage = { organisationId: 'jewel', part: 'process', kind: 'rule', title: 'Opening hours', body: 'Eight to six.', sourceTitle: 'Staff handbook' };
const aRevision = { organisationId: 'jewel', pageId: '00000000-0000-0000-0000-00000000000a', title: 'Opening hours', body: 'Eight to six.', sourceTitle: 'Staff handbook' };

describe('a page naming the source files it was written from', () => {
	beforeEach(() => {
		brain.arrivedFileIds = [handbook];
		vi.clearAllMocks();
	});

	it('names the files that have arrived in the organisation’s brain', async () => {
		const answer = await filePageAction.run(nigelOnJewel, { ...aPage, sourceFileIds: [handbook] });
		expect(brain.nameFiles).toHaveBeenCalledWith(undefined, { organisationId: 'jewel', pageId: 'page-1' }, [handbook]);
		expect(answer).toContain('The page names one source file it was written from.');
	});

	it('files nothing when a file named has not arrived or is not this organisation’s', async () => {
		const answer = await filePageAction.run(nigelOnJewel, { ...aPage, sourceFileIds: [handbook, notSent] });
		expect(answer).toContain(notSent);
		expect(answer).not.toContain(`${handbook},`);
		expect(brain.filePage).not.toHaveBeenCalled();
		expect(brain.nameFiles).not.toHaveBeenCalled();
	});

	it('files nothing when the list is not a list of file ids', async () => {
		expect(await filePageAction.run(nigelOnJewel, { ...aPage, sourceFileIds: ['handbook.pdf'] })).toBe(sourceFileIdsRefusal);
		expect(brain.filePage).not.toHaveBeenCalled();
	});

	it('names the files on a revision once the page has taken it', async () => {
		const answer = await fileRevisionAction.run(nigelOnJewel, { ...aRevision, sourceFileIds: [handbook] });
		expect(brain.revisePage).toHaveBeenCalledOnce();
		expect(brain.nameFiles).toHaveBeenCalledWith(undefined, { organisationId: 'jewel', pageId: 'page-1' }, [handbook]);
		expect(answer).toContain('The page names one source file');
	});

	it('names the files on a page that already reads so, leaving its text and history alone', async () => {
		const answer = await fileRevisionAction.run(nigelOnJewel, { ...aRevision, body: 'Nine to five.', sourceFileIds: [handbook] });
		expect(brain.revisePage).not.toHaveBeenCalled();
		expect(brain.nameFiles).toHaveBeenCalledOnce();
		expect(answer).toContain('its text and history are unchanged');
	});
});
