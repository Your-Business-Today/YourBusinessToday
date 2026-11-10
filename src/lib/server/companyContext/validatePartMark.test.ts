import { describe, expect, it } from 'vitest';
import { companyContextLimits } from '$lib/data/companyContext/companyContextLimits';
import { validatePartMark } from './validatePartMark';

function markForm(values: Record<string, string>): FormData {
	const form = new FormData();
	const filled = { versionNumber: '3', partKey: 'quoting', ...values };
	for (const [field, value] of Object.entries(filled)) form.set(field, value);
	return form;
}

function refusalFor(values: Record<string, string>): string {
	const reading = validatePartMark(markForm(values));
	return 'refusal' in reading ? reading.refusal : '';
}

describe("a client's mark on a part, read from the portal's form", () => {
	it('reads right, and not right with what is wrong', () => {
		expect(validatePartMark(markForm({ reviewState: 'right' }))).toEqual({
			versionNumber: 3,
			partKey: 'quoting',
			reviewState: 'right',
			whatIsWrong: null
		});
		const notRight = validatePartMark(markForm({ reviewState: 'not_right', whatIsWrong: ' The visit comes first. ' }));
		expect(notRight).toMatchObject({ reviewState: 'not_right', whatIsWrong: 'The visit comes first.' });
	});

	it('refuses not right without words, and words with right', () => {
		expect(refusalFor({ reviewState: 'not_right' })).toContain('Say what is wrong');
		expect(refusalFor({ reviewState: 'right', whatIsWrong: 'Nothing' })).toContain('kept only with Not right');
	});

	it('refuses words longer than their column, and an email address or phone number', () => {
		const tooMany = 'x'.repeat(companyContextLimits.whatIsWrongLength + 1);
		expect(refusalFor({ reviewState: 'not_right', whatIsWrong: tooMany })).toContain(
			`keep it to ${companyContextLimits.whatIsWrongLength} characters`
		);
		expect(refusalFor({ reviewState: 'not_right', whatIsWrong: 'Ask jo@example.com' })).toContain('email address');
	});

	it('refuses a mark that is not right or not right, a version that is not a whole number and a bad key', () => {
		expect(refusalFor({ reviewState: 'not_checked' })).toContain('must be one of: right, not_right');
		expect(refusalFor({ reviewState: 'right', versionNumber: '2.5' })).toContain('whole number');
		expect(refusalFor({ reviewState: 'right', versionNumber: '0' })).toContain('whole number');
		expect(refusalFor({ reviewState: 'right', partKey: 'Quoting Process' })).toContain('lower-case words');
	});
});
