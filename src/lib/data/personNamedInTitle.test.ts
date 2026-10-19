import { describe, expect, it } from 'vitest';
import { nameUsedInTitles, titleNamesPerson } from './personNamedInTitle';

describe('nameUsedInTitles', () => {
	it('takes the first word of the account name', () => {
		expect(nameUsedInTitles('Jeremy Smith', 'j@example.com')).toBe('Jeremy');
	});

	it('has none when the account is named only by its email', () => {
		expect(nameUsedInTitles('j@example.com', 'j@example.com')).toBeNull();
	});
});

describe('titleNamesPerson', () => {
	it.each([
		'Jeremy: ask Xero API support for the bank statement scope',
		'FIX: Abbot Road claim 6 is dated wrongly (Jeremy to confirm first)',
		"jeremy's Claude: promote the board"
	])('finds the name in "%s"', (title) => {
		expect(titleNamesPerson(title, 'Jeremy')).toBe(true);
	});

	it('does not find a name inside another word', () => {
		expect(titleNamesPerson('Ask Jeremyson about the lease', 'Jeremy')).toBe(false);
	});
});
