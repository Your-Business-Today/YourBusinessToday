import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fileOfBytes, fileOfSize, openBox } from './boxStandIns';
import { outcomes } from './boxFiles.js';

type StepCall = { step: string; fields: Record<string, string> };

const granted = { outcome: outcomes.granted, uploadId: 'upload-1', uploadUrl: 'https://store.example/put' };
const attached = { outcome: outcomes.attached, filename: 'grid.png', size: '4 B' };
const storage = {
	takesTheFile: async () => ({ ok: true }),
	refusesTheFile: async () => ({ ok: false }),
	isForbiddenByTheHost: async () => Promise.reject(new TypeError('blocked by the host'))
};

let stepCalls: StepCall[] = [];
let stepAnswers: unknown[] = [];
let storageRequests: [string, RequestInit][] = [];
let answerFromStorage = storage.takesTheFile;

vi.mock('./boxSteps.js', () => ({
	steps: { open: 'open', grant: 'grant', record: 'record', attach: 'attach' },
	performStep: async (_taskId: string, step: string, fields: Record<string, string> = {}) => {
		stepCalls.push({ step, fields });
		return stepAnswers.shift() ?? attached;
	}
}));

function stepsTaken(): string[] {
	return stepCalls.map((call) => call.step);
}

async function freshSendFile(storageAnswer: typeof answerFromStorage) {
	answerFromStorage = storageAnswer;
	vi.resetModules();
	const uploads = await import('./boxUploads.js');
	return uploads.sendFile;
}

describe('sending a file from the upload box', () => {
	beforeEach(() => {
		stepCalls = [];
		stepAnswers = [granted];
		storageRequests = [];
		vi.stubGlobal('fetch', (address: string, request: RequestInit) => {
			storageRequests.push([address, request]);
			return answerFromStorage();
		});
	});

	it('goes straight to storage where the host allows it, then is recorded', async () => {
		const sendFile = await freshSendFile(storage.takesTheFile);
		expect(await sendFile(openBox, fileOfBytes([1, 2, 3, 4]))).toEqual(attached);
		expect(stepsTaken()).toEqual(['grant', 'record']);
		const putOfThePicture = { method: 'PUT', headers: { 'content-type': 'image/png' } };
		expect(storageRequests).toMatchObject([[granted.uploadUrl, putOfThePicture]]);
	});

	it('travels through the connector, byte for byte, when storage cannot be reached', async () => {
		const sendFile = await freshSendFile(storage.isForbiddenByTheHost);
		const bytes = [0, 255, 16, 128, 7];
		expect(await sendFile(openBox, fileOfBytes(bytes))).toEqual(attached);
		expect(stepsTaken()).toEqual(['grant', 'attach']);
		const { contentBase64, filename } = stepCalls[1].fields;
		expect([...Buffer.from(contentBase64, 'base64')]).toEqual(bytes);
		expect(filename).toBe('grid.png');
	});

	it('stops asking storage once the host has forbidden it', async () => {
		const sendFile = await freshSendFile(storage.isForbiddenByTheHost);
		await sendFile(openBox, fileOfBytes([1]));
		await sendFile(openBox, fileOfBytes([2]));
		expect(stepsTaken()).toEqual(['grant', 'attach', 'attach']);
		expect(storageRequests).toHaveLength(1);
	});

	it('points a file too big for the connector at the upload page', async () => {
		const sendFile = await freshSendFile(storage.isForbiddenByTheHost);
		const bigFile = fileOfSize(openBox.largestRelayedFileBytes + 1, 'site-photo.png');
		const pointedElsewhere = await sendFile(openBox, bigFile);
		expect(pointedElsewhere.outcome).toBe(outcomes.needsUploadPage);
		expect(pointedElsewhere.reason).toContain('upload page');
		expect(stepsTaken()).toEqual(['grant']);
	});

	it('falls back to the connector when storage answers but will not take the file', async () => {
		const sendFile = await freshSendFile(storage.refusesTheFile);
		expect(await sendFile(openBox, fileOfBytes([9]))).toEqual(attached);
		expect(stepsTaken()).toEqual(['grant', 'attach']);
	});

	it('reports what the connector refused, and refuses an empty file itself', async () => {
		const sendFile = await freshSendFile(storage.takesTheFile);
		const refused = { outcome: outcomes.refused, reason: 'A file name is at most 255 characters.' };
		stepAnswers = [refused];
		expect(await sendFile(openBox, fileOfBytes([1]))).toEqual(refused);
		expect(await sendFile(openBox, fileOfBytes([]))).toMatchObject({ outcome: outcomes.refused });
		expect(stepsTaken()).toEqual(['grant']);
		expect(storageRequests).toHaveLength(0);
	});
});
