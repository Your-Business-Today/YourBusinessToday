import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { clientDocumentCatalogue } from '$lib/data/clientDocumentCatalogue';
import { readClientDocumentBySlug } from '../readClientDocumentBySlug';
import { buildWordDocument } from './buildWordDocument';

function documentXmlOf(markdown: string): string {
	return strFromU8(unzipSync(buildWordDocument(markdown))['word/document.xml']);
}

describe('buildWordDocument', () => {
	it('packages the parts Word needs to open the file', () => {
		const partNames = Object.keys(unzipSync(buildWordDocument('# Title')));
		expect(partNames).toEqual(
			expect.arrayContaining([
				'[Content_Types].xml',
				'_rels/.rels',
				'word/document.xml',
				'word/styles.xml'
			])
		);
	});

	it('writes headings in heading styles and bold text in bold runs', () => {
		const documentXml = documentXmlOf('# Agreement\n\n1.1 **Precedence.** Schedule 1 wins.');
		expect(documentXml).toContain('<w:pStyle w:val="Heading1"/>');
		expect(documentXml).toContain(
			'<w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Precedence.</w:t>'
		);
	});

	it('escapes characters that would break the XML', () => {
		expect(documentXmlOf('Terms & "conditions"')).toContain('Terms &amp; &quot;conditions&quot;');
	});

	it('turns a markdown table into a Word table with a header row', () => {
		const documentXml = documentXmlOf(
			'| Party | Name |\n| --- | --- |\n| Client | [Client legal name] |'
		);
		expect(documentXml).toContain('<w:tblHeader/>');
		expect(documentXml).toContain('[Client legal name]');
	});

	it('shows an unticked task as an empty box', () => {
		expect(documentXmlOf('- [ ] Discovery')).toContain('☐ ');
	});
});

describe('the client documents', () => {
	it('has written every document the catalogue lists', () => {
		const missingSlugs = clientDocumentCatalogue
			.map((entry) => entry.slug)
			.filter((slug) => readClientDocumentBySlug(slug) === undefined);
		expect(missingSlugs).toEqual([]);
	});
});
