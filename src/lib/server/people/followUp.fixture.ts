import type { FollowUp } from './getFollowUpsDue';

export const samId = '11111111-1111-4111-8111-111111111111';
export const riversLtdId = '33333333-3333-4333-8333-333333333333';
export const yourBusinessTodayId = 'org-your-business-today';
export const jewelId = 'org-jewel';

/** Sam Rivers, a director at Rivers Ltd on Your Business Today's register, with a call due on 12 Nov 2026. */
export function followUpWith(facts: Partial<FollowUp> = {}): FollowUp {
	return {
		id: samId,
		name: 'Sam Rivers',
		email: 'sam@example.com',
		phone: '020 7946 0000',
		officerId: null,
		sourceUrl: '',
		leadSource: 'staff',
		createdAt: '2026-11-01T09:00:00Z',
		seniority: 'director',
		isDecisionMaker: true,
		warmth: 'warm',
		lastContactedOn: '2026-11-01',
		nextAction: 'Call about the portal demo',
		nextActionDue: '2026-11-12',
		companies: [{ id: riversLtdId, name: 'Rivers Ltd', stage: 'lead', keptByOrganisationId: yourBusinessTodayId }],
		...facts
	};
}
