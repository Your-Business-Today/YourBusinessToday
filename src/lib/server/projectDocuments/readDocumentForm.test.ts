import { describe, expect, it } from 'vitest';
import { readDocumentForm } from './readDocumentForm';

function formOf(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [field, value] of Object.entries(fields)) formData.set(field, value);
	return formData;
}

describe('a Documents page form as the checks read it', () => {
	it('keeps what was typed, reads counts as numbers and leaves out what was left empty', () => {
		const form = formOf({ title: 'Spec', summary: '', section: ' ', filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: '2048', other: 'x' });
		expect(readDocumentForm(form)).toEqual({ title: 'Spec', filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: 2048 });
	});
});
