import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emailPathwayActions } from './emailPathwayActions';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';
import type { McpCaller } from '../resolveMcpCaller';

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const acme = { id: 'client-acme', name: 'Acme Ltd', stage: 'client' };
const acmeProject = { id: 'project-acme', name: 'Acme bookings', clientId: acme.id };
const ourProject = { id: 'project-ours', name: 'YourBusinessToday', clientId: null };
const email = {
	mailbox: 'consulting@yourbusiness.today',
	messageId: '18c2f0a9b1d3e4f5',
	threadId: '18c2f0a9b1d3e4f0',
	direction: 'received',
	from: 'joanne@acme.example',
	to: ['consulting@yourbusiness.today'],
	subject: 'The booking page is down',
	sentAt: '2026-11-16T09:30:00Z',
	summary: 'Says the booking page shows an error since this morning.'
};

const { reaching, raisingTask, raisingSupport, findingSender, filing } = vi.hoisted(() => ({
	reaching: vi.fn(),
	raisingTask: vi.fn(),
	raisingSupport: vi.fn(),
	findingSender: vi.fn(),
	filing: vi.fn()
}));
vi.mock('../projectAccess', () => ({ reachableProject: reaching }));
vi.mock('./raiseTask', () => ({ raiseTask: raisingTask }));
vi.mock('./raiseSupportTask', () => ({ raiseSupportTask: raisingSupport }));
vi.mock('$lib/server/filedEmails/findEmailSender', async (importOriginal) => ({
	...(await importOriginal<object>()),
	findEmailSender: findingSender
}));
vi.mock('$lib/server/filedEmails/fileEmail', () => ({ fileEmailAgainst: filing }));

function run(actionName: string, input: Record<string, unknown>) {
	const action = emailPathwayActions.find((candidate) => candidate.name === actionName);
	return action!.run(staff, input);
}

let filedTargets: unknown[] = [];

beforeEach(() => {
	vi.clearAllMocks();
	filedTargets = [];
	filing.mockImplementation(async (_supabase: unknown, given: { target: unknown }) => {
		filedTargets.push(given.target);
		return { id: 'filed-1', isAlreadyFiled: false };
	});
	raisingTask.mockResolvedValue({ taskId: 'task-1', sentence: 'Task raised.' });
	raisingSupport.mockResolvedValue({ taskId: 'task-2', sentence: 'Support request raised.' });
});

describe('raising a task from an email', () => {
	it('raises a support request when the sender is the client whose project it is, filed against it and under the client', async () => {
		reaching.mockResolvedValue(acmeProject);
		findingSender.mockResolvedValue({ client: acme, personId: 'person-joanne' });
		const answer = String(await run('raise_task_from_email', { projectId: acmeProject.id, title: 'Booking page down', ...email }));
		expect(raisingSupport).toHaveBeenCalledWith(staff, expect.objectContaining({ title: 'Booking page down', want: email.summary }));
		expect(raisingTask).not.toHaveBeenCalled();
		expect(filedTargets).toEqual([{ kind: 'task', id: 'task-2' }, { kind: 'client', id: acme.id }]);
		expect(answer).toContain('Support request raised.');
		expect(answer).toContain('YBT/Acme Ltd');
	});

	it('raises a task as create_task does on any other project, still filing the email under the sender', async () => {
		reaching.mockResolvedValue(ourProject);
		findingSender.mockResolvedValue({ client: acme, personId: null });
		await run('raise_task_from_email', { projectId: ourProject.id, title: 'Look at Acme bookings', ...email });
		expect(raisingSupport).not.toHaveBeenCalled();
		expect(filedTargets).toEqual([{ kind: 'task', id: 'task-1' }, { kind: 'client', id: acme.id }]);
	});

	it('keeps the email against the task alone when the sender is nobody we hold as one client', async () => {
		reaching.mockResolvedValue(ourProject);
		findingSender.mockResolvedValue({ client: null, personId: null });
		const answer = String(await run('raise_task_from_email', { projectId: ourProject.id, title: 'Reply', ...email }));
		expect(filedTargets).toEqual([{ kind: 'task', id: 'task-1' }]);
		expect(answer).toContain('file_email_to_client');
	});

	it('refuses an email that does not fit before reading anything, and files nothing when the raising is refused', async () => {
		expect(await run('raise_task_from_email', { projectId: ourProject.id, title: 'Reply', ...email, sentAt: 'Monday' })).toBe(filedEmailRefusals.sentAt);
		expect(reaching).not.toHaveBeenCalled();
		reaching.mockResolvedValue(ourProject);
		findingSender.mockResolvedValue({ client: null, personId: null });
		raisingTask.mockResolvedValue('A task needs a title.');
		expect(await run('raise_task_from_email', { projectId: ourProject.id, ...email })).toBe('A task needs a title.');
		expect(filing).not.toHaveBeenCalled();
	});
});
