import type { SupabaseClient } from '@supabase/supabase-js';
import type { WatchOutcome } from './watchRunLog';
import type { WatchSource } from './watchSource';

export const chatbotRecordKeepingSourceName = 'chatbot_record_keeping';

/** The most questions one pass deletes, and the most passes one knock makes, so a long backlog is worked down over the nights. */
const keepingRunLimits = { mostDeletedInAPass: 500, mostPassesInARun: 20 } as const;

/** Knocked by Vercel's crons each night: deletes every question on a chatbot record older than its organisation's keeping period, recording each deletion. */
export const chatbotRecordKeepingSource: WatchSource = {
	name: chatbotRecordKeepingSourceName,
	summary: "deletes each chatbot record's questions older than the keeping period its organisation set, recording each deletion",
	run: deletePastKeeping
};

async function deletePastKeeping(supabase: SupabaseClient): Promise<WatchOutcome> {
	const { mostDeletedInAPass, mostPassesInARun } = keepingRunLimits;
	let deletedCount = 0;
	for (let pass = 0; pass < mostPassesInARun; pass++) {
		const deletedInPass = await deleteOnePass(supabase, mostDeletedInAPass);
		deletedCount += deletedInPass;
		if (deletedInPass < mostDeletedInAPass) return outcomeOf(deletedCount, true);
	}
	return outcomeOf(deletedCount, false);
}

async function deleteOnePass(supabase: SupabaseClient, mostDeleted: number): Promise<number> {
	const { data, error } = await supabase.rpc('delete_chatbot_record_past_keeping', { most_deleted: mostDeleted });
	if (error) throw error;
	return Number(data ?? 0);
}

function outcomeOf(deletedCount: number, isFinished: boolean): WatchOutcome {
	const rest = isFinished ? '' : ' More are past it; the next knock carries on.';
	const note = `${deletedCount} questions past their keeping period deleted from chatbot records.${rest}`;
	return { rowsWritten: deletedCount, resumeMarker: new Date().toISOString(), note, isFinished };
}
