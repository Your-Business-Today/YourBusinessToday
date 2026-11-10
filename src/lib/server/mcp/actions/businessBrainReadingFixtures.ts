import { businessBrainActions } from './businessBrainActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

/** A page of Jewel's brain, a source it came from and a member of Jewel, as the reading tests use them. */
export const pageId = '00000000-0000-0000-0000-00000000000a';

export const openingHours = {
	pageId,
	partKind: 'process',
	kind: 'rule',
	title: 'Opening hours',
	summary: 'When the office is open',
	updatedAt: '2026-11-03T09:00:00Z'
};

export const staffHandbook = { sourceId: 'source-1', title: 'Staff handbook', origin: 'handbook.pdf', summary: '', filedAt: '2026-11-03T09:00:00Z' };

export const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

export function brainAction(name: string): McpAction {
	return businessBrainActions.find((candidate) => candidate.name === name) as McpAction;
}
