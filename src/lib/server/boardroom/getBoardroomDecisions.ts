import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import {
	boardDecisionColumns,
	boardDecisionTables,
	decisionAnswerColumns,
	decisionRuleColumns,
	parseBoardDecisionRecord,
	parseDecisionAnswerRecord,
	parseDecisionRuleRecord
} from './boardroomDecisionRecord';
import { modelArticlesRule, noMeetingDecisions, type DecisionRule, type MeetingDecisions } from '$lib/data/boardroomDecision';

/** The rule an organisation's directors last recorded from its own articles, or the model articles; undefined before 0189 has run. */
async function getRuleInForce(supabase: SupabaseClient, organisationId: string): Promise<DecisionRule | undefined> {
	const { data, error } = await supabase
		.from(boardDecisionTables.rules)
		.select(decisionRuleColumns)
		.eq('organisation_id', organisationId)
		.order('recorded_at', { ascending: false })
		.limit(1);
	if (isSchemaNotYetMigrated(error)) return undefined;
	if (error) throw error;
	const latest = data[0];
	return latest === undefined ? modelArticlesRule : parseDecisionRuleRecord(latest);
}

async function rowsOfMeeting(supabase: SupabaseClient, table: string, columns: string, meetingId: string) {
	const { data, error } = await supabase.from(table).select(columns).eq('meeting_id', meetingId);
	if (error) throw error;
	return (data ?? []) as unknown as Record<string, unknown>[];
}

/**
 * A meeting's decisions and every director's answer to them, which every director of the board reads, with the
 * rule a decision put now is decided by. Nothing at all until migration 0189 has run.
 */
export async function getDecisionsOfMeeting(supabase: SupabaseClient, organisationId: string, meetingId: string): Promise<MeetingDecisions> {
	const ruleInForce = await getRuleInForce(supabase, organisationId);
	if (ruleInForce === undefined) return noMeetingDecisions;
	const [decisions, answers] = await Promise.all([
		rowsOfMeeting(supabase, boardDecisionTables.decisions, boardDecisionColumns, meetingId),
		rowsOfMeeting(supabase, boardDecisionTables.answers, decisionAnswerColumns, meetingId)
	]);
	return { decisions: decisions.map(parseBoardDecisionRecord), answers: answers.map(parseDecisionAnswerRecord), ruleInForce };
}
