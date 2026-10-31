import { describe, expect, it } from 'vitest';
import { describeSummary, nothingOwed } from './describeSummary';
import { unnamedAccountNotice } from './describeOwedTasks';
import { jeremyOwes, nothingAtAll } from './summaryFixtures';

describe('the YBT summary', () => {
	const described = describeSummary(jeremyOwes).join('\n');

	it('opens with the totals by kind, and leaves building to Claude', () => {
		expect(described).toContain(
			"In all: one answer to give, one thing to set up, no features to test, one task to do, one to-do. Everything to be built is Claude's."
		);
	});

	it('keeps information, setup and to-dos in sections of their own, in that order', () => {
		const informationAt = described.indexOf('## Information you need to give (1)');
		const setupAt = described.indexOf('## Things you need to set up (1)');
		const todosAt = described.indexOf('## Your to-dos (1)');
		expect(informationAt).toBeGreaterThanOrEqual(0);
		expect(setupAt).toBeGreaterThan(informationAt);
		expect(todosAt).toBeGreaterThan(setupAt);
		expect(described).not.toContain('Things you need to test');
	});

	it('reads an ask posted before kinds existed as information', () => {
		const informationSection = described.slice(0, described.indexOf('## Things you need to set up'));
		expect(informationSection).toContain('which bank feeds do you use?');
	});

	it('lists each to-do with the task it serves', () => {
		expect(described).toContain('Put insurance in place — To do, for "Get the website presentable"');
	});

	it('lists the business tasks assigned to the person as theirs to do, before their to-dos', () => {
		const tasksAt = described.indexOf('## Your tasks (1)');
		expect(tasksAt).toBeGreaterThan(described.indexOf('## Things you need to set up'));
		expect(described.indexOf('## Your to-dos')).toBeGreaterThan(tasksAt);
		expect(described).toContain('"Put public liability insurance in place", Backlog (Jewel Property Serve Portal, Administration');
	});

	it('shows development tasks still in the person’s name, to be turned into asks', () => {
		expect(described).toContain('Development tasks in your name');
		expect(described).toContain('"Move the enquiries backlog", Backlog (Jewel Property Serve Portal, Development, task id: backlog)');
		expect(described).toContain('Jeremy: ask Xero for the bank statement scope');
	});

	it('says so when nothing needs the person', () => {
		expect(describeSummary(nothingAtAll)).toEqual([nothingOwed]);
	});

	it('says when tasks titled with the person’s name were not looked for, even with nothing owed', () => {
		const owed = { ...nothingAtAll.owed, name: null };
		expect(describeSummary({ ...nothingAtAll, owed })).toEqual([unnamedAccountNotice, '', nothingOwed]);
	});
});
