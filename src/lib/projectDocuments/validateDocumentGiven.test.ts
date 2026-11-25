import { describe, expect, it } from 'vitest';
import { contentRefusal, validateDocumentGiven } from './validateDocumentGiven';
import { validateDocumentDetailChanges } from './validateDocumentDetails';

const pdf = { filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: 2048 };

describe('a new project document as described', () => {
	it('keeps a written document with the section and position it is given, or the defaults', () => {
		expect(validateDocumentGiven({ title: ' How it works ', markdown: '# How it works' })).toEqual({
			details: { title: 'How it works', summary: '', section: 'General', position: 0, status: 'draft', flow: 'output' },
			content: { markdown: '# How it works' }
		});
	});

	it('keeps a file as described', () => {
		const given = validateDocumentGiven({ title: 'Spec', section: 'Product', position: 2, ...pdf });
		expect(given).toMatchObject({ details: { section: 'Product', position: 2 }, content: { file: pdf } });
	});

	it('refuses both or neither of text and file', () => {
		expect(validateDocumentGiven({ title: 'Spec' })).toBe(contentRefusal);
		expect(validateDocumentGiven({ title: 'Spec', markdown: 'x', ...pdf })).toBe(contentRefusal);
	});

	it('refuses by name a value its column cannot hold', () => {
		expect(validateDocumentGiven({ title: '', markdown: 'x' })).toMatch(/^title/);
		expect(validateDocumentGiven({ title: 'Spec', markdown: '   ' })).toMatch(/^markdown/);
		expect(validateDocumentGiven({ title: 'Spec', ...pdf, mimeType: 'application/zip' })).toMatch(/^mimeType/);
		expect(validateDocumentGiven({ title: 'Spec', ...pdf, byteCount: 26 * 1024 * 1024 })).toMatch(/^byteCount/);
		expect(validateDocumentGiven({ title: 'Spec', markdown: 'x', position: -1 })).toMatch(/^position/);
	});

	it('checks only the details a change names', () => {
		expect(validateDocumentDetailChanges({ position: 3 })).toEqual({ position: 3 });
		expect(validateDocumentDetailChanges({ section: '' })).toMatch(/^section/);
	});
});
