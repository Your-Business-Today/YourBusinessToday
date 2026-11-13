import { describe, expect, it } from 'vitest';
import { nameSpeltByEmail } from './nameSpeltByEmail';

describe('nameSpeltByEmail', () => {
	it('spells a name from the words before the @', () => {
		expect(nameSpeltByEmail('nigel.reilly@jewelenterprises.co.uk')).toBe('Nigel Reilly');
	});

	it('reads underscores, hyphens and digits as the gaps between words', () => {
		expect(nameSpeltByEmail('JAMES_beadle-2@example.com')).toBe('James Beadle');
	});

	it('gives a single word when the mailbox is one word', () => {
		expect(nameSpeltByEmail('consulting@yourbusiness.today')).toBe('Consulting');
	});

	it('gives the address itself when the mailbox spells no word', () => {
		expect(nameSpeltByEmail('123@example.com')).toBe('123@example.com');
	});
});
