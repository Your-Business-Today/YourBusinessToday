import { describe, expect, it } from 'vitest';
import { documentDownloadHref, documentHref, documentsHref, writtenDownloadKindAt, writtenDownloadKinds } from './documentAddresses';

const guide = { projectId: 'harbour', id: 'guide' };

describe('where a project’s documents are read and downloaded', () => {
	it('lists them under the project, and reads and downloads each beneath', () => {
		expect(documentsHref('harbour')).toBe('/projects/harbour/documents');
		expect(documentHref(guide)).toBe('/projects/harbour/documents/guide');
		expect(documentDownloadHref(guide)).toBe('/projects/harbour/documents/guide/download');
		expect(documentDownloadHref(guide, writtenDownloadKinds.markdown)).toBe('/projects/harbour/documents/guide/download?as=markdown');
	});

	it('downloads a written document as Word unless Markdown is named', () => {
		expect(writtenDownloadKindAt(new URL('https://portal.example/d?as=markdown'))).toBe(writtenDownloadKinds.markdown);
		expect(writtenDownloadKindAt(new URL('https://portal.example/d?as=pdf'))).toBe(writtenDownloadKinds.word);
		expect(writtenDownloadKindAt(new URL('https://portal.example/d'))).toBe(writtenDownloadKinds.word);
	});
});
