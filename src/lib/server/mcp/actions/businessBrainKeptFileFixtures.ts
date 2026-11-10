/** A staff handbook and a site photo kept in Jewel's brain, as the kept file tests use them. */
export const handbookFileId = '00000000-0000-0000-0000-00000000000f';

export const handbookPdf = {
	fileId: handbookFileId,
	filename: 'staff-handbook-2026.pdf',
	mimeType: 'application/pdf',
	byteCount: 2048,
	recordedAt: '2026-11-03T09:00:00Z'
};

export const sitePhoto = { ...handbookPdf, fileId: '00000000-0000-0000-0000-0000000000f2', filename: 'site-board.jpg', mimeType: 'image/jpeg' };

export const keptHandbook = {
	id: handbookFileId,
	organisationId: 'jewel',
	filename: 'staff-handbook-2026.pdf',
	mimeType: 'application/pdf',
	byteCount: 2048,
	storagePath: `jewel/${handbookFileId}/staff-handbook-2026.pdf`
};

/** The kept file reads of a brain that keeps no file. */
export const noKeptFiles = {
	readKeptBusinessBrainFiles: async () => ({ keptCount: 0, unnamed: [], unnamedCount: 0 }),
	readFilesNamedByPage: async () => []
};
