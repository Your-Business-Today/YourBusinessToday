import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatbotRecordKeepingActions } from './chatbotRecordKeepingActions';
import { keptDaysRefusal } from '$lib/server/businessBrain/validateChatbotRecordKeeping';
import { noSuchQuestionOnTheRecord } from '$lib/server/businessBrain/deleteChatbotQuestion';
import { notAnOrganisationManager } from '../organisationAccess';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const record = vi.hoisted(() => ({ questionIds: [] as string[], deleted: [] as Record<string, unknown>[], keptDays: [] as (number | null)[] }));

vi.mock('$lib/server/organisations/getOrganisation', () => ({ getOrganisation: async () => ({ id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' }) }));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/deleteChatbotQuestion', async (original) => ({
	...(await original<object>()),
	isQuestionOnTheRecord: async (_supabase: unknown, _organisationId: string, questionId: string) => record.questionIds.includes(questionId),
	deleteChatbotQuestion: async (_supabase: unknown, deletion: Record<string, unknown>) => void record.deleted.push(deletion)
}));
vi.mock('$lib/server/businessBrain/chatbotRecordKeeping', () => ({
	readChatbotRecordKeeping: async () => ({ keptDays: record.keptDays.at(-1) ?? null, setAt: null }),
	setChatbotRecordKeeping: async (_supabase: unknown, change: { keptDays: number | null }) => void record.keptDays.push(change.keptDays)
}));

const questionId = '00000000-0000-0000-0000-000000000101';
const manager = { accountId: 'nigel', isStaff: false, organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: true }] } as unknown as McpCaller;
const member = { accountId: 'stuart', isStaff: false, organisationMemberships: [{ organisationId: 'jewel', accountId: 'stuart', isManager: false }] } as unknown as McpCaller;
const recordAction = (name: string) => chatbotRecordKeepingActions.find((candidate) => candidate.name === name) as McpAction;

describe("a business deletes from its chatbot record and sets how long it is kept", () => {
	beforeEach(() => {
		record.questionIds.splice(0, record.questionIds.length, questionId);
		record.deleted.splice(0);
		record.keptDays.splice(0);
	});

	it('lets a manager delete a question on the record, as them', async () => {
		const deleteQuestion = recordAction('delete_business_brain_chatbot_question');
		expect(deleteQuestion.isWrite).toBe(true);
		expect(await deleteQuestion.run(manager, { organisationId: 'jewel', questionId })).toContain('The deletion is recorded');
		expect(record.deleted).toEqual([{ organisationId: 'jewel', accountId: 'nigel', questionId }]);
	});

	it('refuses anyone who does not manage the organisation, a question not on its record and an id that is not one', async () => {
		const deleteQuestion = recordAction('delete_business_brain_chatbot_question');
		expect(await deleteQuestion.run(member, { organisationId: 'jewel', questionId })).toBe(notAnOrganisationManager);
		const missing = '00000000-0000-0000-0000-0000000009ff';
		expect(await deleteQuestion.run(manager, { organisationId: 'jewel', questionId: missing })).toBe(noSuchQuestionOnTheRecord);
		expect(await deleteQuestion.run(manager, { organisationId: 'jewel', questionId: 'the first one' })).toContain('must be an id');
		expect(record.deleted).toEqual([]);
	});

	it('sets a keeping period in whole days within its limits, and back to the life of the Brain when left out', async () => {
		const setKeeping = recordAction('set_business_brain_chatbot_record_keeping');
		expect(await setKeeping.run(manager, { organisationId: 'jewel', keptDays: 90 })).toContain('kept for 90 days');
		expect(await setKeeping.run(manager, { organisationId: 'jewel' })).toContain('for as long as the Brain is kept');
		for (const keptDays of [0, 3651, 1.5, 'a year']) {
			expect(await setKeeping.run(manager, { organisationId: 'jewel', keptDays })).toBe(keptDaysRefusal);
		}
		expect(await setKeeping.run(member, { organisationId: 'jewel', keptDays: 30 })).toBe(notAnOrganisationManager);
		expect(record.keptDays).toEqual([90, null]);
	});
});
