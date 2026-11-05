import { describe, expect, it } from 'vitest';
import { describeTurn, nothingToRaise } from './describeTurn';
import type { AgendaItem } from './agendaItem';

const now = new Date('2026-11-05T12:00:00Z');
const nameOf = (accountId: string) => (accountId === 'james' ? 'James' : 'Someone');
const insurance: AgendaItem = {
	key: 'message:ask-1', kind: 'information', isBug: false, projectId: 'ybt', projectName: 'YourBusinessToday',
	subjectKind: 'task', subjectId: 'insurance', subjectTitle: 'Buy cyber insurance', ask: 'Which insurer do we go with?',
	askedById: 'james', since: '2026-11-02T09:00:00Z', goal: null
};
const record = (lastSpokeAt: string | null) => ({ lastSpokeAt, lastItemKey: null, snoozedKeys: new Set<string>() });

describe('one turn of the conversation', () => {
	it('raises one item with its key, why it matters and what a good answer is', () => {
		const turn = describeTurn({ agenda: { items: [insurance, insurance], record: record(null) }, nameOf, now }).join('\n');
		expect(turn).toContain('Item 1 of 2.');
		expect(turn).toContain('## Information to give: "Buy cyber insurance" on YourBusinessToday (task id: insurance)');
		expect(turn).toContain('- Item key: message:ask-1');
		expect(turn).toContain('James asked, waiting 3 days, since 2 Nov 2026');
		expect(turn).toContain('- The ask: Which insurer do we go with?');
	});

	it('opens afresh when the person has not spoken lately, and not mid-conversation', () => {
		const fresh = describeTurn({ agenda: { items: [insurance], record: record('2026-11-01T09:00:00Z') }, nameOf, now });
		expect(fresh.join('\n')).toContain('since they last spoke on 1 Nov 2026, one new thing');
		const midway = describeTurn({ agenda: { items: [insurance], record: record('2026-11-05T11:55:00Z') }, nameOf, now });
		expect(midway.join('\n')).not.toContain('Open in two lines');
	});

	it('says so when nothing needs the person', () => {
		expect(describeTurn({ agenda: { items: [], record: record(null) }, nameOf, now })).toEqual([nothingToRaise]);
	});
});
