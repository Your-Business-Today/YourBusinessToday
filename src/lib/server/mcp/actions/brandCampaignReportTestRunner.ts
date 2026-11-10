import { brandCampaignReportActions } from './brandCampaignReportActions';
import type { McpCaller } from '../resolveMcpCaller';

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

/** Runs one of the campaign report actions as Nigel, on Jewel. */
export function runReportAction(name: string, input: Record<string, unknown>): Promise<string> {
	const action = brandCampaignReportActions.find((candidate) => candidate.name === name)!;
	return action.run(nigelOnJewel, { organisationId: 'jewel', ...input }).then(String);
}
