import { describe, expect, it } from 'vitest';
import { exportedSentence, type ExportedCounts } from './exportedSentence';

const counts: ExportedCounts = { tableCount: 90, rowCount: 1200, fileCount: 3, byteCount: 2_500_000, missingFiles: [], partLinks: ['a'] };

describe('exportedSentence', () => {
	it('says what the export carried and how long its links last', () => {
		expect(exportedSentence('Jewel', counts)).toBe(
			"Jewel's data is exported: 1200 rows in 90 tables and 3 stored files, 2.4 MB in one zip. " +
				'The download links last an hour, and the export is on the log.'
		);
	});

	it('counts the zips of a large export, and names the files storage no longer held', () => {
		const sentence = exportedSentence('Jewel', { ...counts, partLinks: ['a', 'b'], missingFiles: ['files/x'] });
		expect(sentence).toContain('in 2 zips.');
		expect(sentence).toContain('1 file a record names were no longer in storage; files/missing.txt lists them.');
	});
});
