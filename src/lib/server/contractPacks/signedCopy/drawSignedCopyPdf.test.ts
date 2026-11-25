import { describe, expect, it } from 'vitest';
import { extractText, getDocumentProxy } from 'unpdf';
import { drawSignedCopyPdf } from './drawSignedCopyPdf';
import { markdownRows } from './markdownRows';
import { signedCopyFilename, type SignedCopy } from './signedCopy';

const markdown = [
	'# Order Form',
	'',
	'## 1. The parties',
	'',
	'This Order Form is between **Your Business Today Ltd** and [Harbour Dental Care](https://example.com).',
	'',
	'',
	'- The fee is £1,200 a month.',
	'| Stage | Fee |',
	'| --- | --- |',
	'| Discovery | £3,000 |'
].join('\n');

const copy: SignedCopy = {
	title: 'Order Form',
	clientName: 'Harbour Dental Care Ltd',
	versionNumber: 3,
	markdown,
	clientSignature: { versionNumber: 3, signerName: 'Ada Lane', signerPosition: 'Director', signedOn: '2026-11-24', signedAt: '2026-11-24T10:15:00Z' },
	countersignature: { signerName: 'James Beadle', signerPosition: 'Director', signedOn: '2026-11-25', signedAt: '2026-11-25T18:40:00Z' }
};

async function textOf(bytes: Uint8Array): Promise<string> {
	const pdf = await getDocumentProxy(bytes);
	const { text } = await extractText(pdf, { mergePages: true });
	return text;
}

describe('a signed copy of a contract document', () => {
	it('prints the version, the text the client signed and who signed for each side and when', async () => {
		const text = await textOf(await drawSignedCopyPdf(copy));
		const facts = [
			'Order Form',
			'Version 3, signed by both sides',
			'Between Your Business Today Ltd and Harbour Dental Care Ltd',
			'1. The parties',
			'The fee is £1,200 a month.',
			'SIGNED FOR HARBOUR DENTAL CARE LTD',
			'Ada Lane',
			'24 Nov 2026',
			'SIGNED FOR YOUR BUSINESS TODAY LTD',
			'James Beadle',
			'25 Nov 2026'
		];
		facts.forEach((fact) => expect(text).toContain(fact));
	});

	it('runs a long document on to further pages', async () => {
		const long = Array.from({ length: 120 }, (_, index) => `Clause ${index + 1}. The client keeps its data.`).join('\n\n');
		const pdf = await getDocumentProxy(await drawSignedCopyPdf({ ...copy, markdown: long }));
		expect(pdf.numPages).toBeGreaterThan(1);
	});

	it('is named for the document, the version signed and that it is signed', () => {
		expect(signedCopyFilename(copy)).toBe('order-form-version-3-signed.pdf');
	});
});

describe('a document written in Markdown, as a PDF prints it', () => {
	it('drops the marks, the table rule and repeated blank lines, and keeps the words', () => {
		const texts = markdownRows(markdown).map((row) => row.text);
		expect(texts).toEqual([
			'Order Form',
			'',
			'1. The parties',
			'',
			'This Order Form is between Your Business Today Ltd and Harbour Dental Care.',
			'',
			'• The fee is £1,200 a month.',
			'Stage   Fee',
			'Discovery   £3,000'
		]);
	});
});
