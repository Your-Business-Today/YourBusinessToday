import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessBrainFileActions } from './businessBrainFileActions';
import { byteCountRefusal } from '$lib/data/businessBrainFileRules';
import { fileNotArrived, linkLapsedUnused, noSuchBusinessBrainFile } from './businessBrainFileAnswers';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { McpCaller } from '../resolveMcpCaller';

const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	fileFound: null as Record<string, unknown> | null,
	recording: { status: 'recorded', byteCount: 2048 } as Record<string, unknown>,
	grantUpload: vi.fn(),
	findFile: vi.fn()
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/businessBrain/grantBusinessBrainFileUpload', () => ({
	grantBusinessBrainFileUpload: (...given: unknown[]) => {
		brain.grantUpload(...given);
		return Promise.resolve({ fileId: 'file-1', uploadUrl: 'https://storage.example/upload?token=t', expiresAt: '2026-11-10T20:00:00Z' });
	}
}));
vi.mock('$lib/server/businessBrain/findBusinessBrainFiles', () => ({
	findSentFile: (...given: unknown[]) => {
		brain.findFile(...given);
		return Promise.resolve(brain.fileFound);
	}
}));
vi.mock('$lib/server/businessBrain/recordBusinessBrainFile', async (original) => ({
	...(await original<typeof import('$lib/server/businessBrain/recordBusinessBrainFile')>()),
	recordBusinessBrainFile: async () => brain.recording
}));

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;
const [grantAction, recordAction] = businessBrainFileActions;
const aFile = { organisationId: 'jewel', filename: 'handbook.pdf', mimeType: 'application/pdf', byteCount: 2048 };
const theFileId = '00000000-0000-0000-0000-00000000000f';
const aGrantedFile = { id: theFileId, organisationId: 'jewel', filename: 'handbook.pdf', mimeType: 'application/pdf', byteCount: null, storagePath: 'jewel/f/handbook.pdf', sentBy: 'nigel', expiresAt: '2026-11-10T20:00:00Z', recordedAt: null };

describe("sending a source file into Your Business Brain", () => {
	beforeEach(() => {
		brain.switchedOn = ['business_brain'];
		brain.fileFound = aGrantedFile;
		brain.recording = { status: 'recorded', byteCount: 2048 };
		vi.clearAllMocks();
	});

	it('grants no link while Your Business Brain is off for the organisation', async () => {
		brain.switchedOn = ['books'];
		expect(await grantAction.run(nigelOnJewel, aFile)).toBe(moduleNotSwitchedOn('business_brain'));
		expect(brain.grantUpload).not.toHaveBeenCalled();
	});

	it('grants no link for a file larger than the brain keeps', async () => {
		expect(await grantAction.run(nigelOnJewel, { ...aFile, byteCount: 30 * 1024 * 1024 })).toBe(byteCountRefusal);
		expect(brain.grantUpload).not.toHaveBeenCalled();
	});

	it('grants a link under the organisation and the person who asked, and says how to send and record it', async () => {
		const answer = await grantAction.run(nigelOnJewel, aFile);
		expect(brain.grantUpload).toHaveBeenCalledWith(undefined, { organisationId: 'jewel', accountId: 'nigel' }, { filename: 'handbook.pdf', mimeType: 'application/pdf', byteCount: 2048 });
		expect(answer).toContain('curl --fail --upload-file');
		expect(answer).toContain('record_business_brain_file_upload with organisationId jewel and fileId file-1');
	});

	it('keeps the file that arrived, under the person the link was granted to', async () => {
		const answer = await recordAction.run(nigelOnJewel, { organisationId: 'jewel', fileId: theFileId });
		expect(brain.findFile).toHaveBeenCalledWith(undefined, { organisationId: 'jewel', accountId: 'nigel' }, theFileId);
		expect(answer).toContain('"handbook.pdf" (2 KB) is kept in Jewel Enterprises\'s Your Business Brain');
	});

	it('records nothing for a link granted to someone else', async () => {
		brain.fileFound = null;
		expect(await recordAction.run(nigelOnJewel, { organisationId: 'jewel', fileId: theFileId })).toBe(noSuchBusinessBrainFile);
	});

	it('says so when nothing has arrived yet, or the link lapsed unused', async () => {
		brain.recording = { status: 'not_arrived' };
		expect(await recordAction.run(nigelOnJewel, { organisationId: 'jewel', fileId: theFileId })).toBe(fileNotArrived);
		brain.recording = { status: 'lapsed' };
		expect(await recordAction.run(nigelOnJewel, { organisationId: 'jewel', fileId: theFileId })).toBe(linkLapsedUnused);
	});
});
