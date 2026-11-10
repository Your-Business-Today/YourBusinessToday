import { businessBrainActions } from './businessBrainActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

/** A member of Jewel, a mail thread read through Microsoft 365 and two pages written from it, as the filing tests use them. */
export const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

export const roofThread = {
	sourceTitle: 'Mail thread: Roof at Elm Court, 3 to 7 Nov 2026',
	sourceOrigin: 'office@jewel.example, "Roof at Elm Court"'
};

export const scaffold = { part: 'experience', kind: 'fact', title: 'Scaffold at Elm Court', body: 'Up from 10 Nov.' };

export const roofer = { part: 'people', kind: 'supplier', title: 'Elm Court roofer', body: 'Coombe Roofing.' };

const filePagesAction = businessBrainActions.find((action) => action.name === 'file_business_brain_pages') as McpAction;

export const filePagesGuidance = filePagesAction.guidance ?? '';

export function filePages(input: Record<string, unknown>) {
	return filePagesAction.run(nigelOnJewel, { organisationId: 'jewel', ...input });
}
