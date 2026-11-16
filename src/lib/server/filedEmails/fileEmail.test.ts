import { describe, expect, it } from 'vitest';
import { fileEmail, fileEmailAgainst } from './fileEmail';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FiledEmailGiven } from '$lib/data/filedEmailRules';

const enquiry: FiledEmailGiven = {
	clientId: '11111111-1111-4111-8111-111111111111',
	personId: null,
	mailbox: 'Consulting@YourBusiness.Today',
	messageId: 'm1',
	threadId: 't1',
	direction: 'received',
	from: 'joanne@acme.example',
	to: [],
	subject: 'Help',
	sentAt: '2026-11-16T09:30:00Z',
	summary: 'Asks for help.'
};

type Row = { id: string; client_id: string; mailbox: string; gmail_message_id: string };

/** A filed_emails table that holds rows and refuses a second filing of one email under one client, as 0256's index does. */
function tableOf(rows: Row[]): SupabaseClient {
	const isHeld = (row: Record<string, unknown>) =>
		rows.some((held) => held.client_id === row.client_id && held.gmail_message_id === row.gmail_message_id && held.mailbox.toLowerCase() === String(row.mailbox).toLowerCase());
	const answering = (answer: unknown) => ({ select: () => ({ single: async () => answer }) });
	const insert = (row: Record<string, unknown>) => {
		if (isHeld(row)) return answering({ data: null, error: { code: '23505' } });
		const id = `filed-${rows.length + 1}`;
		const kept = { id, client_id: String(row.client_id), mailbox: String(row.mailbox), gmail_message_id: String(row.gmail_message_id) };
		rows.push(kept);
		return answering({ data: { id }, error: null });
	};
	const select = () => ({ eq: (_: string, clientId: string) => ({ eq: async (__: string, messageId: string) => ({ data: rows.filter((row) => row.client_id === clientId && row.gmail_message_id === messageId), error: null }) }) });
	return { from: () => ({ insert, select }) } as unknown as SupabaseClient;
}

describe('fileEmail', () => {
	it('keeps one row when the same email is filed twice under one client, answering with that row', async () => {
		const rows: Row[] = [];
		const supabase = tableOf(rows);
		const first = await fileEmail(supabase, enquiry, 'staff-1');
		const second = await fileEmail(supabase, { ...enquiry, mailbox: 'consulting@yourbusiness.today' }, 'staff-1');
		expect(first).toEqual({ id: 'filed-1', isAlreadyFiled: false });
		expect(second).toEqual({ id: 'filed-1', isAlreadyFiled: true });
		expect(rows).toHaveLength(1);
	});
});

describe('fileEmailAgainst', () => {
	it('files the email against a task in the task column alone, leaving the client empty', async () => {
		const inserted: Record<string, unknown>[] = [];
		const insert = (row: Record<string, unknown>) => {
			inserted.push(row);
			return { select: () => ({ single: async () => ({ data: { id: 'filed-9' }, error: null }) }) };
		};
		const supabase = { from: () => ({ insert }) } as unknown as SupabaseClient;
		const { clientId: _clientId, personId, ...facts } = enquiry;
		const outcome = await fileEmailAgainst(supabase, { ...facts, personId, target: { kind: 'task', id: 'task-1' } }, 'staff-1');
		expect(outcome).toEqual({ id: 'filed-9', isAlreadyFiled: false });
		expect(inserted[0]).toMatchObject({ task_id: 'task-1', gmail_message_id: 'm1' });
		expect(inserted[0]).not.toHaveProperty('client_id');
	});
});
