import type { DecisionSource } from './decision';

/** Who set a decision, as a client reads it on the brand kit page. */
export const decisionSourceLabels: Record<DecisionSource, string> = {
	onboarding: 'Set at onboarding',
	staff: 'Set by Your Business Today',
	client: 'Set by you',
	mcp: 'Set by your Claude',
	learned: 'Learned from what worked'
};
