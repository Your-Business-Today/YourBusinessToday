import { brandContentActions } from './brandContentActions';
import type { McpCaller } from '../resolveMcpCaller';

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

/** Runs one of the brand content actions as Nigel, on Jewel. */
export function runContentAction(name: string, input: Record<string, unknown>): Promise<string> {
	const action = brandContentActions.find((candidate) => candidate.name === name)!;
	return action.run(nigelOnJewel, { organisationId: 'jewel', ...input }).then(String);
}
