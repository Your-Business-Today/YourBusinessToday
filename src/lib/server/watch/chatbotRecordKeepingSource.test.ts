import { describe, expect, it } from 'vitest';
import { chatbotRecordKeepingSource } from './chatbotRecordKeepingSource';
import type { SupabaseClient } from '@supabase/supabase-js';

const start = { resumeMarker: '', wasLastRunFinished: true };
const noProgress = async () => {};

function databaseDeleting(passes: number[]) {
	const asked: unknown[] = [];
	const supabase = {
		rpc: async (name: string, args: unknown) => {
			asked.push({ name, args });
			return { data: passes.shift() ?? 0, error: null };
		}
	} as unknown as SupabaseClient;
	return { supabase, asked };
}

describe('the overnight deletion of chatbot records past their keeping period', () => {
	it('deletes pass by pass until a pass finds fewer than it may delete', async () => {
		const { supabase, asked } = databaseDeleting([500, 12]);
		const outcome = await chatbotRecordKeepingSource.run(supabase, start, noProgress);
		expect(outcome).toMatchObject({ rowsWritten: 512, isFinished: true });
		expect(asked).toEqual([
			{ name: 'delete_chatbot_record_past_keeping', args: { most_deleted: 500 } },
			{ name: 'delete_chatbot_record_past_keeping', args: { most_deleted: 500 } }
		]);
	});

	it('leaves the rest for the next knock once it has made its passes', async () => {
		const { supabase } = databaseDeleting(Array(20).fill(500));
		const outcome = await chatbotRecordKeepingSource.run(supabase, start, noProgress);
		expect(outcome).toMatchObject({ rowsWritten: 10000, isFinished: false });
		expect(outcome.note).toContain('the next knock carries on');
	});
});
