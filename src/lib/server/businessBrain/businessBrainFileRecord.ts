/** A source file of an organisation's brain: the upload link granted for it, and once it has arrived, its size. */
export type BusinessBrainFile = {
	id: string;
	organisationId: string;
	filename: string;
	mimeType: string;
	byteCount: number | null;
	storagePath: string;
	sentBy: string | null;
	expiresAt: string;
	recordedAt: string | null;
};

export function parseBusinessBrainFile(row: Record<string, unknown>): BusinessBrainFile {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: (row.byte_count as number | null) ?? null,
		storagePath: row.storage_path as string,
		sentBy: (row.sent_by as string | null) ?? null,
		expiresAt: row.expires_at as string,
		recordedAt: (row.recorded_at as string | null) ?? null
	};
}
