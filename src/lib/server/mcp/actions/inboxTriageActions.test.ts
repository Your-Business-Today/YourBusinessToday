import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inboxTriageActions } from './inboxTriageActions';
import { unknownFiling } from './describeTriageRecording';
import { filedEmailRefusals } from '$lib/server/filedEmails/validateFiledEmail';
import type { McpCaller } from '../resolveMcpCaller';

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const mailbox = 'consulting@yourbusiness.today';
const decision = { messageId: '18c2f0a9b1d3e4f5', threadId: '18c2f0a9b1d3e4f0', outcome: 'set_aside' };
const noOutcomes = { filed: 3, new_lead: 1, task: 0, todo: 0, set_aside: 2 };

const { reading, recording } = vi.hoisted(() => ({ reading: vi.fn(), recording: vi.fn() }));
vi.mock('$lib/server/emailTriage/readInboxTriage', () => ({ readInboxTriage: reading }));
vi.mock('$lib/server/emailTriage/recordTriageDecisions', () => ({ recordTriageDecisions: recording }));

function run(actionName: string, input: Record<string, unknown>) {
	const action = inboxTriageActions.find((candidate) => candidate.name === actionName);
	return action!.run(staff, input);
}

describe('reading where triage of an inbox stands', () => {
	beforeEach(() => vi.clearAllMocks());

	it('says when the last decision was made, how to search Gmail and which ids to skip', async () => {
		reading.mockResolvedValue({
			mailbox,
			lastDecidedAt: '2026-11-16T09:30:00.000Z',
			recentMessageIds: ['aaa', 'bbb'],
			recentCount: 6,
			countsByOutcome: noOutcomes
		});
		const answer = String(await run('read_inbox_triage', { mailbox: 'Consulting@yourbusiness.today' }));
		expect(reading).toHaveBeenCalledWith(staff.supabase, mailbox, expect.any(Date));
		expect(answer).toContain('2026-11-16T09:30:00.000Z');
		expect(answer).toContain('in:inbox -label:YBT/Triaged after:2026/11/15');
		expect(answer).toContain('Set aside 2');
		expect(answer).toContain('the latest 500');
		expect(answer).toContain('aaa, bbb');
	});

	it('searches the days remembered when nothing has been triaged, and refuses a mailbox that is not an address', async () => {
		reading.mockResolvedValue({ mailbox, lastDecidedAt: null, recentMessageIds: [], recentCount: 0, countsByOutcome: noOutcomes });
		const answer = String(await run('read_inbox_triage', { mailbox }));
		expect(answer).toContain('Nothing has been triaged');
		expect(answer).toContain('newer_than:30d');
		expect(await run('read_inbox_triage', { mailbox: 'consulting' })).toBe(filedEmailRefusals.mailbox);
	});
});

describe('recording triage decisions', () => {
	beforeEach(() => vi.clearAllMocks());

	it('records the decisions as the caller and names the emails decided before', async () => {
		recording.mockResolvedValue({ recordedMessageIds: ['18c2f0a9b1d3e4f5'], decidedBeforeMessageIds: ['ccc'] });
		const answer = String(await run('record_triage_decision', { mailbox, decisions: [decision] }));
		expect(recording).toHaveBeenCalledWith(staff.supabase, [{ mailbox, ...decision, filedEmailId: null, note: '' }], 'staff-1');
		expect(answer).toContain('Decisions recorded: 1');
		expect(answer).toContain('YBT/Triaged');
		expect(answer).toContain('left as they were: ccc');
	});

	it('refuses what does not fit before writing, and a filing that is not held', async () => {
		expect(String(await run('record_triage_decision', { mailbox, decisions: [] }))).toContain('1 to 50');
		expect(recording).not.toHaveBeenCalled();
		recording.mockResolvedValue(null);
		expect(await run('record_triage_decision', { mailbox, decisions: [decision] })).toBe(unknownFiling);
	});
});
