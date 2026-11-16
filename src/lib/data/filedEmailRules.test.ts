import { describe, expect, it } from 'vitest';
import { gmailThreadLink } from './filedEmailRules';

describe('gmailThreadLink', () => {
	it('opens the thread in Gmail signed in as the mailbox it was filed from', () => {
		const link = gmailThreadLink({ mailbox: 'consulting@yourbusiness.today', threadId: '18c2f0a9b1d3e4f0' });
		expect(link).toBe('https://mail.google.com/mail/u/?authuser=consulting%40yourbusiness.today#all/18c2f0a9b1d3e4f0');
	});
});
