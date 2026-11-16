import type { TriageRecording } from '$lib/data/triageDecisionRules';

export const unknownFiling = 'A filedEmailId names no filed email, so nothing was recorded. Give the id file_email_to_client answered with, or leave it out.';

/** What a recording kept, and which emails were decided before and left as they were. */
export function describeTriageRecording(recording: TriageRecording | null): string {
	if (recording === null) return unknownFiling;
	const { recordedMessageIds, decidedBeforeMessageIds } = recording;
	const recordedLine = `Decisions recorded: ${recordedMessageIds.length}. Label each email YBT/Triaged in Gmail.`;
	const hasNoneDecidedBefore = decidedBeforeMessageIds.length === 0;
	if (hasNoneDecidedBefore) return recordedLine;
	return `${recordedLine}\nDecided before, so left as they were: ${decidedBeforeMessageIds.join(', ')}`;
}
