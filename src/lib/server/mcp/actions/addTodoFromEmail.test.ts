import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emailPathwayActions } from './emailPathwayActions';
import type { McpCaller } from '../resolveMcpCaller';

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const acme = { id: 'client-acme', name: 'Acme Ltd', stage: 'client' };
const email = {
	mailbox: 'consulting@yourbusiness.today',
	messageId: '18c2f0a9b1d3e4f5',
	threadId: '18c2f0a9b1d3e4f0',
	direction: 'received',
	from: 'joanne@acme.example',
	subject: 'The booking page is down',
	sentAt: '2026-11-16T09:30:00Z',
	summary: 'Says the booking page shows an error since this morning.'
};
const todo = { id: 'todo-1', title: 'Reply to Joanne', status: 'to_do', dueDate: null, taskTitle: null, projectName: null, taskId: null };

const { addingTodo, findingSender, filing } = vi.hoisted(() => ({ addingTodo: vi.fn(), findingSender: vi.fn(), filing: vi.fn() }));
vi.mock('./addTodoFromInput', () => ({ addTodoFromInput: addingTodo }));
vi.mock('$lib/server/filedEmails/findEmailSender', () => ({ findEmailSender: findingSender }));
vi.mock('$lib/server/filedEmails/fileEmail', () => ({ fileEmailAgainst: filing }));

const addTodoFromEmail = emailPathwayActions.find((action) => action.name === 'add_todo_from_email')!;
let filedTargets: unknown[] = [];
let givenNotes = '';

beforeEach(() => {
	vi.clearAllMocks();
	filedTargets = [];
	filing.mockImplementation(async (_supabase: unknown, given: { target: unknown }) => {
		filedTargets.push(given.target);
		return { id: 'filed-1', isAlreadyFiled: false };
	});
	addingTodo.mockImplementation(async (_caller: unknown, input: { notes: string }) => {
		givenNotes = input.notes;
		return todo;
	});
	findingSender.mockResolvedValue({ client: acme, personId: 'person-joanne' });
});

describe('adding a to-do from an email', () => {
	it('names the email in the to-do’s notes with its Gmail link, and keeps it against the to-do and its client', async () => {
		const answer = String(await addTodoFromEmail.run(staff, { title: 'Reply to Joanne', notes: 'Say we are on it.', ...email }));
		expect(givenNotes).toContain('Say we are on it.');
		expect(givenNotes).toContain('From the email "The booking page is down" from joanne@acme.example');
		expect(givenNotes).toContain('#all/18c2f0a9b1d3e4f0');
		expect(filedTargets).toEqual([{ kind: 'todo', id: 'todo-1' }, { kind: 'client', id: acme.id }]);
		expect(answer).toContain('Reply to Joanne');
	});

	it('files nothing when the to-do is refused', async () => {
		addingTodo.mockResolvedValue('A to-do needs a title.');
		expect(await addTodoFromEmail.run(staff, { ...email })).toBe('A to-do needs a title.');
		expect(filing).not.toHaveBeenCalled();
	});
});
