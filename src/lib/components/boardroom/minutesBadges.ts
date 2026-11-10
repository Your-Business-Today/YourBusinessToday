import { minutesAnswers, type MinutesAnswerKind } from '$lib/data/boardroomMinutes';
import type { DecisionBadge } from './decisionBadges';

export const minutesAnswerBadges: Record<MinutesAnswerKind, DecisionBadge> = {
	[minutesAnswers.approves]: { label: 'Approves', tone: 'positive' },
	[minutesAnswers.asksForChange]: { label: 'Asks for a change', tone: 'progress' }
};

export const approvedBadge: DecisionBadge = { label: 'Approved', tone: 'positive' };
export const awaitingApprovalBadge: DecisionBadge = { label: 'Waiting for the directors', tone: 'progress' };
