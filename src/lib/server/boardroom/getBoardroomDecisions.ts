import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { rowsOfMeeting } from './rowsOfMeeting';
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

/** Where a proposal says it replaces an earlier decision: the board, the meeting it is proposed at, and the decision named. */
export type ReplacedDecision = { organisationId: string; meetingId: string; decisionId: string };

/** Whether the board took the named decision at another, earlier meeting, so a proposal now may replace it. */
export async function isEarlierDecisionOfBoard(supabase: SupabaseClient, replaced: ReplacedDecision): Promise<boolean> {
	const { data, error } = await supabase
		.from(boardDecisionTables.decisions)
		.select('id')
		.eq('id', replaced.decisionId)
		.eq('organisation_id', replaced.organisationId)
		.neq('meeting_id', replaced.meetingId)
		.maybeSingle();
	if (error) throw error;
	return data !== null;
}
