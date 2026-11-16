/** What triage did with an email: filed it, raised something from it, or set it aside. */
export type TriageOutcome = 'filed' | 'new_lead' | 'task' | 'todo' | 'set_aside';

export const triageOutcomeLabels: Record<TriageOutcome, string> = {
	filed: 'Filed under a client or lead',
	new_lead: 'Made a new lead',
	task: 'Raised a task or support request',
	todo: 'Put on a to-do list',
	set_aside: 'Set aside'
};

export const triageOutcomes = Object.keys(triageOutcomeLabels) as TriageOutcome[];

/** The limits on a triage decision, stated once and mirrored by migration 0257. */
export const triageDecisionLimits = {
	longestNote: 500,
	mostPerCall: 50,
	daysRemembered: 30,
	mostIdsShown: 500
} as const;

/** One decision as a Claude records it, checked by validateTriageDecisions before anything is written. */
export type TriageDecisionGiven = {
	mailbox: string;
	messageId: string;
	threadId: string;
	outcome: TriageOutcome;
	filedEmailId: string | null;
	note: string;
};

/** Which of the decisions were kept now, and which emails had been decided before and were left as they were. */
export type TriageRecording = { recordedMessageIds: string[]; decidedBeforeMessageIds: string[] };

export function isTriageOutcome(candidate: string): candidate is TriageOutcome {
	return triageOutcomes.some((outcome) => outcome === candidate);
}
