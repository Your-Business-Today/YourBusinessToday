import { fileBusinessBrainPageGuidance, fileBusinessBrainRevisionGuidance } from './businessBrainGuidance';
import { fileBusinessBrainPageSchema, fileBusinessBrainRevisionSchema } from './businessBrainSchemas';
import { fileNewPage, fileRevision } from './businessBrainFilingRuns';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const businessBrainModule = 'business_brain';

export const businessBrainActions: McpAction[] = [
	moduleAction(businessBrainModule, {
		name: 'file_business_brain_page',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "file a new page into an organisation's Your Business Brain: one subject, its text, the part of the business it belongs to and the source it came from",
		guidance: fileBusinessBrainPageGuidance,
		inputSchema: fileBusinessBrainPageSchema,
		run: fileNewPage
	}),
	moduleAction(businessBrainModule, {
		name: 'file_business_brain_page_revision',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "file a revision of a page in an organisation's Your Business Brain: the earlier version goes into the page's history and nothing is overwritten",
		guidance: fileBusinessBrainRevisionGuidance,
		inputSchema: fileBusinessBrainRevisionSchema,
		run: fileRevision
	})
];
