import { describe, expect, it } from 'vitest';
import { objectSchema, textField } from './actionTypes';
import { recordIdRefusal } from './recordIdRefusal';

const wholeId = '2a2808b1-547d-489d-bfef-3f8252615aac';
const shortenedId = '2a2808b1';
const gmailId = '18c2f3a4b5d6e7f8';

const readTaskSchema = objectSchema({ taskId: textField('The task id') }, ['taskId']);
const journalLineSchema = objectSchema({ accountId: textField('The account') }, ['accountId']);
const journalSchema = objectSchema({ lines: { type: 'array', items: journalLineSchema } }, ['lines']);
const bankRuleSchema = objectSchema({ account: journalLineSchema });
const gmailSchema = objectSchema(
	{ messageId: textField('The Gmail message'), threadId: textField('The Gmail thread') },
	['messageId', 'threadId']
);

describe('recordIdRefusal, for an id left out or held deeper in the input', () => {
	it('refuses a required id left out entirely, naming the field', () => {
		const refusal = recordIdRefusal('read_task', readTaskSchema, {});
		expect(refusal).toContain('taskId');
		expect(refusal).toContain('It was left out');
	});

	it('refuses a required id sent as null', () => {
		expect(recordIdRefusal('read_task', readTaskSchema, { taskId: null })).toContain('taskId');
	});

	it('checks an id inside each record of a list, naming where it is', () => {
		const input = { lines: [{ accountId: wholeId }, { accountId: '' }] };
		expect(recordIdRefusal('post_journal', journalSchema, input)).toContain('lines[1].accountId');
	});

	it('checks an id inside a record of its own', () => {
		const input = { account: { accountId: shortenedId } };
		expect(recordIdRefusal('set_bank_rule', bankRuleSchema, input)).toContain('account.accountId');
	});

	it('leaves a record of its own alone when it is left out', () => {
		expect(recordIdRefusal('set_bank_rule', bankRuleSchema, {})).toBeNull();
	});

	it('leaves a Gmail message and thread id alone, since they name no record of ours', () => {
		const input = { messageId: gmailId, threadId: gmailId };
		expect(recordIdRefusal('file_email_to_client', gmailSchema, input)).toBeNull();
	});
});
