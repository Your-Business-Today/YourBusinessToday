import { describe, expect, it } from 'vitest';
import {
	parseUploadGrantRecord,
	uploadGrantStanding,
	uploadLinkLifetimeSeconds
} from './uploadGrantRecord';

const now = new Date('2026-09-28T10:00:00Z');
const oneMinuteMilliseconds = 60 * 1000;

function grant(overrides: Partial<ReturnType<typeof parseUploadGrantRecord>> = {}) {
	return {
		id: 'grant-1',
		taskId: 'task-1',
		grantedTo: 'account-1',
		filename: 'policy-sign-off-form.png',
		mimeType: 'image/png',
		storagePath: 'task-1/grant-1/policy-sign-off-form.png',
		expiresAt: new Date(now.getTime() + uploadLinkLifetimeSeconds * 1000).toISOString(),
		recordedAt: null,
		...overrides
	};
}

describe('uploadGrantStanding', () => {
	it('is open while the link is live and unused', () => {
		expect(uploadGrantStanding(grant(), now)).toBe('open');
	});

	it('is used once the file has been recorded, whatever the time', () => {
		expect(uploadGrantStanding(grant({ recordedAt: now.toISOString() }), now)).toBe('used');
	});

	it('expires once its lifetime has passed', () => {
		const late = new Date(now.getTime() + uploadLinkLifetimeSeconds * 1000 + oneMinuteMilliseconds);
		expect(uploadGrantStanding(grant(), late)).toBe('expired');
	});

	it('lives for fifteen minutes', () => {
		expect(uploadLinkLifetimeSeconds).toBe(15 * 60);
	});

	it('reads a row into a grant, with no recording as null', () => {
		const parsed = parseUploadGrantRecord({
			id: 'grant-1',
			task_id: 'task-1',
			granted_to: 'account-1',
			filename: 'brief.pdf',
			mime_type: 'application/pdf',
			storage_path: 'task-1/grant-1/brief.pdf',
			expires_at: now.toISOString(),
			recorded_at: null
		});
		expect(parsed.recordedAt).toBeNull();
		expect(parsed.mimeType).toBe('application/pdf');
	});
});
