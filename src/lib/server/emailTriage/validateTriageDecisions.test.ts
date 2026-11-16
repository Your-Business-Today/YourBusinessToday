import { describe, expect, it } from 'vitest';
import { triageDecisionRefusals, validateTriageDecisions } from './validateTriageDecisions';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';

const filedEmailId = '33333333-3333-4333-8333-333333333333';
const filed = { messageId: '18c2f0a9b1d3e4f5', threadId: '18c2f0a9b1d3e4f0', outcome: 'filed', filedEmailId };
const newsletter = { messageId: '18c2f0a9b1d3e4f6', threadId: '18c2f0a9b1d3e4f6', outcome: 'set_aside', note: 'Newsletter' };

function check(decisions: unknown, mailbox = 'Consulting@YourBusiness.today') {
	return validateTriageDecisions({ mailbox, decisions });
}

describe('checking triage decisions against their columns', () => {
	it('keeps the mailbox in lower case and a missing filing or note as none', () => {
		expect(check([filed, newsletter])).toEqual([
			{ mailbox: 'consulting@yourbusiness.today', ...filed, note: '' },
			{ mailbox: 'consulting@yourbusiness.today', ...newsletter, filedEmailId: null }
		]);
	});

	it('refuses a mailbox, a list or an outcome that does not fit, naming the decision', () => {
		expect(check([filed], 'the consulting inbox')).toBe(filedEmailRefusals.mailbox);
		expect(check([])).toBe(triageDecisionRefusals.decisions);
		expect(check(Array.from({ length: 51 }, () => filed))).toBe(triageDecisionRefusals.decisions);
		expect(check([filed, { ...newsletter, outcome: 'binned' }])).toBe(`Decision 2: ${triageDecisionRefusals.outcome}`);
	});

	it('refuses ids that are not ids, a note too long and the same email twice', () => {
		expect(check([{ ...filed, messageId: 'two words' }])).toBe(`Decision 1: ${filedEmailRefusals.messageId}`);
		expect(check([{ ...filed, filedEmailId: 'the Acme one' }])).toBe(`Decision 1: ${triageDecisionRefusals.filedEmailId}`);
		expect(check([{ ...newsletter, note: 'x'.repeat(501) }])).toBe(`Decision 1: ${triageDecisionRefusals.note}`);
		expect(check([filed, filed])).toBe(triageDecisionRefusals.twice);
	});
});
