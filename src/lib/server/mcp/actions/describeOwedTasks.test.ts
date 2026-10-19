import { describe, expect, it } from 'vitest';
import { describeOwedTasks } from './describeOwedTasks';
import { parseGlobalTaskRow } from '$lib/server/projects/getGlobalTaskPage';
import { parseMessageRecord } from '$lib/server/conversations/messageRecord';
import type { OwedTasks } from './owedTasks';

const jeremy = { id: 'jeremy', name: 'Jeremy', email: 'jeremy@example.com' };

function taskNamed(id: string, title: string) {
	const row = { id, title, status: 'backlog', kind: 'work', projects: { name: 'Jewel PFP Portal' } };
	return parseGlobalTaskRow(row);
}

const promise = taskNamed('promise', 'Make a £99 test booking and refund it in Stripe');
const xeroScope = taskNamed('xero', 'Jeremy: ask Xero API support for the bank statement scope');
const promiseMessage = parseMessageRecord({
	id: 'message',
	task_id: 'promise',
	author_account_id: 'jeremy',
	body: 'Scarlett, I’ll make a £99 test booking\nand refund it in Stripe.',
	created_at: '2026-10-16T10:00:00Z'
});

const jeremyOwes: OwedTasks = {
	assigned: [promise],
	named: [xeroScope],
	name: 'Jeremy',
	latestByTask: new Map([['promise', promiseMessage]]),
	accounts: [jeremy]
};

describe('the tasks a person owes', () => {
	const described = describeOwedTasks(jeremyOwes).join('\n');

	it('lists an assigned task with its project and its latest message, dated', () => {
		expect(described).toContain('Tasks assigned to you (1):');
		expect(described).toContain('"Make a £99 test booking and refund it in Stripe" on Jewel PFP Portal');
		expect(described).toContain('Latest message, Jeremy, 16 Oct 2026: Scarlett, I’ll make a £99 test booking and refund it');
	});

	it('lists a task titled with their name that nobody assigned to them', () => {
		expect(described).toContain('Tasks that name Jeremy, not assigned to you (1):');
		expect(described).toContain('"Jeremy: ask Xero API support for the bank statement scope"');
		expect(described).toContain('Nothing said on it yet.');
	});

	it('says when the account has no name to look for', () => {
		const unnamed = describeOwedTasks({ ...jeremyOwes, name: null, named: [] }).join('\n');
		expect(unnamed).toContain('Tasks that name you were not looked for');
	});
});
