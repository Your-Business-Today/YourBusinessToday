import { describe, expect, it } from 'vitest';
import { renderClientSetUpEmail } from './clientSetUpEmail';

describe('the email a client’s first people get', () => {
	it('carries the one prompt, written out so it can be copied', () => {
		const email = { personName: 'Ann', organisationName: 'Oak & Ash', openUrl: 'https://example.test', isNewAccount: true };
		const html = renderClientSetUpEmail(email);
		expect(html).toContain('Run my company context with Your Business Today.');
		expect(html).toContain('https://www.yourbusiness.today/api/mcp');
		expect(html).toContain('aren&#39;t in this chat');
	});
});
