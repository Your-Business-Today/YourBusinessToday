import { describe, expect, it } from 'vitest';
import { matchesWords } from './describeProjectImages';
import type { ProjectImage } from '$lib/server/projectImages/projectImageRecord';

const loginScreenshot: ProjectImage = {
	id: '7b0f8a52-1d1e-4a8e-9a55-3c1d0f6b2e11',
	projectId: '121925ec-bf29-46a2-bd62-374f3ca05648',
	filename: 'Login-Error-Screenshot.png',
	mimeType: 'image/png',
	byteCount: 2048,
	storagePath: 'projects/121925ec-bf29-46a2-bd62-374f3ca05648/images/7b0f8a52/login.png',
	uploadedBy: 'f3c1a2b4-5d6e-4f70-8a9b-0c1d2e3f4a5b',
	createdAt: '2026-10-05T12:00:00Z'
};

describe('matchesWords', () => {
	it('matches every image when no words are given', () => {
		expect(matchesWords(loginScreenshot, '')).toBe(true);
	});

	it('matches when every word is in the file name, whatever the case', () => {
		expect(matchesWords(loginScreenshot, 'login error')).toBe(true);
	});

	it('does not match when a word is missing from the file name', () => {
		expect(matchesWords(loginScreenshot, 'login invoice')).toBe(false);
	});
});
