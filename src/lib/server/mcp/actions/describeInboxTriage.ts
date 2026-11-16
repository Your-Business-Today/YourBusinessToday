import { triageDecisionLimits, triageOutcomeLabels, triageOutcomes } from '$lib/data/triageDecisionRules';
import type { InboxTriage } from '$lib/server/emailTriage/readInboxTriage';

const { daysRemembered, mostIdsShown } = triageDecisionLimits;
const notTriagedYet = 'in:inbox -label:YBT/Triaged';
const dayInMilliseconds = 24 * 60 * 60 * 1000;

/** The Gmail search that finds what is still to triage: from the day before the latest decision, or the days remembered. */
export function gmailSearchForTriage(lastDecidedAt: string | null): string {
	if (lastDecidedAt === null) return `${notTriagedYet} newer_than:${daysRemembered}d`;
	const dayBefore = new Date(new Date(lastDecidedAt).getTime() - dayInMilliseconds);
	const [year, month, day] = dayBefore.toISOString().slice(0, 10).split('-');
	return `${notTriagedYet} after:${year}/${month}/${day}`;
}

/** The triage reading as Claude is told it: where the last run stopped, how to search, and the ids to skip. */
export function describeInboxTriage(triage: InboxTriage): string {
	const lines = [
		`Inbox triage of ${triage.mailbox}.`,
		lastDecisionLine(triage.lastDecidedAt),
		`Search Gmail with: ${gmailSearchForTriage(triage.lastDecidedAt)}`,
		`In the last ${daysRemembered} days ${triage.recentCount} emails were decided: ${outcomeCounts(triage)}.`,
		skipLine(triage)
	];
	return lines.join('\n');
}

function lastDecisionLine(lastDecidedAt: string | null): string {
	if (lastDecidedAt === null) return 'Nothing has been triaged in this mailbox yet.';
	return `The last decision was recorded at ${lastDecidedAt}.`;
}

function outcomeCounts(triage: InboxTriage): string {
	return triageOutcomes.map((outcome) => `${triageOutcomeLabels[outcome]} ${triage.countsByOutcome[outcome]}`).join(', ');
}

function skipLine(triage: InboxTriage): string {
	const { recentMessageIds, recentCount } = triage;
	const hasNothingToSkip = recentMessageIds.length === 0;
	if (hasNothingToSkip) return 'No message ids to skip.';
	const isCut = recentCount > recentMessageIds.length;
	const heading = isCut
		? `Skip these message ids, already decided (the latest ${mostIdsShown}; older ones carry the YBT/Triaged label in Gmail):`
		: 'Skip these message ids, already decided:';
	return `${heading} ${recentMessageIds.join(', ')}`;
}
