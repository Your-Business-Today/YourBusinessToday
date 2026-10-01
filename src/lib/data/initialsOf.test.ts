import { describe, expect, it } from 'vitest';
import { initialsOf } from './initialsOf';

describe('initialsOf', () => {
	it('takes the first letter of the first two words of a name', () => {
		expect(initialsOf('Nigel Reilly')).toBe('NR');
	});

	it('reads the mailbox of an email address, ignoring digits', () => {
		expect(initialsOf('jamesbeadle1989@gmail.com')).toBe('ja');
		expect(initialsOf('nigel_reilly@jewelgroup')).toBe('nr');
	});

	it('falls back to a question mark when there are no letters', () => {
		expect(initialsOf('1234')).toBe('?');
	});
});
