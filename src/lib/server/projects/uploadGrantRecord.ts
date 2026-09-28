export type TaskUploadGrant = {
	id: string;
	taskId: string;
	grantedTo: string;
	filename: string;
	mimeType: string;
	storagePath: string;
	expiresAt: string;
	recordedAt: string | null;
};

export type UploadGrantStanding = 'open' | 'expired' | 'used';

export const uploadLinkLifetimeMinutes = 15;
export const uploadLinkLifetimeSeconds = uploadLinkLifetimeMinutes * 60;

export function parseUploadGrantRecord(row: Record<string, unknown>): TaskUploadGrant {
	return {
		id: row.id as string,
		taskId: row.task_id as string,
		grantedTo: row.granted_to as string,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		storagePath: row.storage_path as string,
		expiresAt: row.expires_at as string,
		recordedAt: (row.recorded_at as string | null) ?? null
	};
}

/** Whether a grant can still take its file: once only, and only before it expires. */
export function uploadGrantStanding(grant: TaskUploadGrant, now: Date): UploadGrantStanding {
	if (grant.recordedAt !== null) return 'used';
	if (new Date(grant.expiresAt).getTime() < now.getTime()) return 'expired';
	return 'open';
}
