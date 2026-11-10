import { brandContentActions } from './brandContentActions';
import { brandContentChannelActions } from './brandContentChannelActions';
import { brandContentFlowActions } from './brandContentFlowActions';
import { brandContentPictureActions } from './brandContentPictureActions';
import { brandContentPlanActions } from './brandContentPlanActions';
import type { McpCaller } from '../resolveMcpCaller';

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

/** Runs one of the brand content actions as Nigel, on Jewel. */
export function runContentAction(name: string, input: Record<string, unknown>): Promise<string> {
	const contentActions = [
		...brandContentActions,
		...brandContentChannelActions,
		...brandContentFlowActions,
		...brandContentPlanActions,
		...brandContentPictureActions
	];
	const action = contentActions.find((candidate) => candidate.name === name)!;
	return action.run(nigelOnJewel, { organisationId: 'jewel', ...input }).then(String);
}
