import { describe, expect, it } from 'vitest';
import { describeChatbot, noPurposeYet } from './describeBusinessBrainChatbots';
import { siteTeam } from './businessBrainChatbotFixtures';

describe('a brain as a manager reads it', () => {
	it('says what it is for, what it reads and who uses it', () => {
		const lines = describeChatbot(siteTeam);
		expect(lines).toContain('- For: Answers the site team from our processes');
		expect(lines).toContain('- Reads: Process');
		expect(lines).toContain('- Used by: stuart@example.com');
	});

	it('says plainly when no purpose is given yet', () => {
		expect(describeChatbot({ ...siteTeam, purpose: '' })).toContain(`- For: ${noPurposeYet}`);
	});
});
