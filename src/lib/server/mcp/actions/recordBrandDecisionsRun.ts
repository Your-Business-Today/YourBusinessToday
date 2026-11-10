import { validateDecisionEntry, decisionEntriesOf, type EntryCheck } from './brandDecisionEntries';
import { describeTraitValue } from '$lib/brand/values/traitValue';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { keepBrandDecision, type DecisionKeeping, type DecisionToKeep } from '$lib/server/brandKits/keepBrandDecision';
import { loadBrandKit } from '$lib/server/brandKits/loadBrandKit';
import { noBrandYet } from './brandKitWriteAnswers';
import { readText } from '../actionTypes';
import { DecisionStatuses, type RecordedStatus } from '$lib/brand/decisions/decision';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const recordedStatuses: string[] = [DecisionStatuses.proposed, DecisionStatuses.adopted];
const statusRefusal = `status is ${recordedStatuses.join(' or ')}. Nothing was recorded.`;
const formerlyAdoptedNote = 'Whatever was adopted at the same trait and medium before is retired, and its row is kept.';
const refusedHeading = 'Refused, and not recorded:';
const adoptedMeanwhileProblem = 'another decision was adopted there in the same moment, so this one was not';

/** Records many decisions at once: each is checked against its trait, and one refused leaves the others to go in. */
export async function recordBrandDecisions(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const status = readText(input, 'status');
	if (!recordedStatuses.includes(status)) return statusRefusal;
	const entries = decisionEntriesOf(input.decisions);
	if (typeof entries === 'string') return entries;
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return noBrandYet(organisation);
	const { catalogue } = await loadBrandKit(caller.supabase, organisation.id);
	const keeping = { organisationId: organisation.id, accountId: caller.accountId, status: status as RecordedStatus };
	const recordedLines: string[] = [];
	const refusals: string[] = [];
	for (const entry of entries) {
		const outcome = await recordEntry(caller, keeping, validateDecisionEntry(entry, catalogue));
		if ('refusal' in outcome) refusals.push(outcome.refusal);
		if ('line' in outcome) recordedLines.push(outcome.line);
	}
	return answerOf(organisation, keeping.status, recordedLines, refusals);
}

async function recordEntry(caller: McpCaller, keeping: DecisionKeeping, check: EntryCheck) {
	if ('refusal' in check) return check;
	const { decision } = check;
	const decisionId = await keepBrandDecision(caller.supabase, keeping, decision);
	if (decisionId === null) return { refusal: `${placeOf(decision)}: ${adoptedMeanwhileProblem}` };
	return { line: `- ${placeOf(decision)} = ${describeTraitValue(decision.value)} (id ${decisionId})` };
}

function placeOf(decision: DecisionToKeep): string {
	return `${decision.traitKey} @ ${decision.mediumPath}`;
}

function answerOf(organisation: Organisation, status: RecordedStatus, recordedLines: string[], refusals: string[]): string {
	const total = recordedLines.length + refusals.length;
	const heading = `Recorded ${recordedLines.length} of ${total} decisions in ${organisation.name}’s brand kit as ${status}.`;
	const hasRecorded = recordedLines.length > 0;
	const hasRefused = refusals.length > 0;
	const hasRetiredAny = hasRecorded && status === DecisionStatuses.adopted;
	const recordedSection = recordedLines.join('\n');
	const refusedSection = [refusedHeading, ...refusals.map((refusal) => `- ${refusal}`)].join('\n');
	const sections = [heading];
	if (hasRecorded) sections.push(recordedSection);
	if (hasRetiredAny) sections.push(formerlyAdoptedNote);
	if (hasRefused) sections.push(refusedSection);
	return sections.join('\n\n');
}
