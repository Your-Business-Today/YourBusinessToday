import { describe, expect, it } from 'vitest';
import { documentDownloadHref, documentHref, versionNumberAt, writtenDownloadKindAt, writtenDownloadKinds } from './documentAddress';
import { documentsHrefOf } from '$lib/projectDocuments/documentOwner';

const guide = { owner: { kind: 'project' as const, id: 'harbour' }, id: 'guide' };
const policy = { owner: { kind: 'organisation' as const, id: 'jewel' }, id: 'policy' };

describe('where documents are read and downloaded', () => {
	it('lists a product’s under the product and an organisation’s under the organisation, each read and downloaded beneath', () => {
		expect(documentsHrefOf(guide.owner)).toBe('/projects/harbour/documents');
		expect(documentHref(guide)).toBe('/projects/harbour/documents/guide');
		expect(documentHref(policy)).toBe('/organisations/jewel/documents/policy');
		expect(documentDownloadHref(guide)).toBe('/projects/harbour/documents/guide/download');
		expect(documentDownloadHref(guide, writtenDownloadKinds.markdown)).toBe('/projects/harbour/documents/guide/download?as=markdown');
		expect(documentDownloadHref(policy, undefined, 2)).toBe('/organisations/jewel/documents/policy/download?version=2');
	});

	it('downloads a written document as Word unless Markdown is named', () => {
		expect(writtenDownloadKindAt(new URL('https://portal.example/d?as=markdown'))).toBe(writtenDownloadKinds.markdown);
		expect(writtenDownloadKindAt(new URL('https://portal.example/d?as=pdf'))).toBe(writtenDownloadKinds.word);
		expect(writtenDownloadKindAt(new URL('https://portal.example/d'))).toBe(writtenDownloadKinds.word);
	});

	it('reads the version an address names, and none when it names no whole number', () => {
		expect(versionNumberAt(new URL('https://portal.example/d?version=3'))).toBe(3);
		expect(versionNumberAt(new URL('https://portal.example/d?version=x'))).toBeNull();
		expect(versionNumberAt(new URL('https://portal.example/d'))).toBeNull();
	});
});
