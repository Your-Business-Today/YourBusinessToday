import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { noSuchKeptFile } from './businessBrainFileAnswers';
import { brainAction as action, nigelOnJewel } from './businessBrainReadingFixtures';
import { handbookFileId, keptHandbook } from './businessBrainKeptFileFixtures';

const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	keptFile: null as Record<string, unknown> | null,
	findKeptFile: vi.fn(),
	signLink: vi.fn()
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/businessBrain/findBusinessBrainFiles', () => ({
	findKeptFile: (...given: unknown[]) => brain.findKeptFile(...given) ?? Promise.resolve(brain.keptFile)
}));
vi.mock('$lib/server/storage/signFetchLink', async (original) => ({
	...(await original<typeof import('$lib/server/storage/signFetchLink')>()),
	signFetchLink: (...given: unknown[]) => brain.signLink(...given) ?? Promise.resolve('https://storage.example/handbook?token=t')
}));

const openFile = (input: Record<string, unknown>) => action('open_business_brain_file').run(nigelOnJewel, { organisationId: 'jewel', ...input });

describe('opening a file kept in Your Business Brain', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		brain.switchedOn = ['business_brain'];
		brain.keptFile = keptHandbook;
	});

	it('answers with a short-lived link to fetch the kept file from', async () => {
		const answer = await openFile({ fileId: handbookFileId });
		expect(brain.findKeptFile).toHaveBeenCalledWith(undefined, 'jewel', handbookFileId);
		expect(brain.signLink).toHaveBeenCalledWith(undefined, 'business-brain-files', keptHandbook);
		expect(answer).toContain('"staff-handbook-2026.pdf" (application/pdf, 2 KB)');
		expect(answer).toContain('Fetch it within 10 minutes from:\nhttps://storage.example/handbook?token=t');
	});

	it('refuses by name a fileId that is not an id, looking nothing up', async () => {
		expect(await openFile({ fileId: 'staff-handbook-2026.pdf' })).toContain('The fileId must be an id');
		expect(await openFile({})).toContain('The fileId must be an id');
		expect(brain.findKeptFile).not.toHaveBeenCalled();
	});

	it('opens no file the organisation does not keep, or that has not arrived', async () => {
		brain.keptFile = null;
		expect(await openFile({ fileId: handbookFileId })).toBe(noSuchKeptFile);
		expect(brain.signLink).not.toHaveBeenCalled();
	});

	it('opens nothing where the caller may not use the brain', async () => {
		brain.switchedOn = ['books'];
		expect(await openFile({ fileId: handbookFileId })).toBe(moduleNotSwitchedOn('business_brain'));
		brain.switchedOn = ['business_brain'];
		expect(await openFile({ organisationId: 'elsewhere', fileId: handbookFileId })).toBe(moduleNotSwitchedOn('business_brain'));
		expect(brain.findKeptFile).not.toHaveBeenCalled();
	});

	it('only reads', () => {
		expect(action('open_business_brain_file').isWrite).toBe(false);
	});
});
