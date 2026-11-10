import { reviewStates } from './companyContext';
import type { Confidence, ContextPart, SeenIn } from './companyContext';

const confidenceSentences: Record<Confidence, string> = {
	high: 'Claude is sure of this.',
	medium: 'Claude is fairly sure of this.',
	low: 'Claude is unsure of this, so it is worth checking.'
};

/** Where Claude saw a part, naming the connector and the place but never what it held. */
export function seenSentence(seenIn: SeenIn | null): string {
	if (seenIn === null) return 'Not seen in a connector.';
	if (seenIn.place === null) return `Seen in ${seenIn.connector}.`;
	return `Seen in ${seenIn.connector}, at ${seenIn.place}.`;
}

export function confidenceSentence(part: ContextPart): string {
	return confidenceSentences[part.confidence];
}

/** Whether the client has said the part is right, and what is wrong when it is not. */
export function checkedSentence(part: ContextPart): string {
	if (part.reviewState === reviewStates.right) return 'Checked: right.';
	if (part.reviewState === reviewStates.notRight) return `Checked: not right. ${part.whatIsWrong ?? ''}`.trim();
	return 'Not checked yet.';
}
