import {
	fileBusinessBrainPageGuidance,
	fileBusinessBrainPagesGuidance,
	fileBusinessBrainRevisionGuidance,
	readBusinessBrainIndexGuidance,
	readBusinessBrainPageGuidance,
	searchBusinessBrainGuidance
} from './businessBrainGuidance';
import {
	fileBusinessBrainPageSchema,
	fileBusinessBrainRevisionSchema,
	readBusinessBrainIndexSchema,
	readBusinessBrainPageSchema,
	searchBusinessBrainSchema
} from './businessBrainSchemas';
import { fileBusinessBrainPagesSchema } from './businessBrainBatchSchema';
import { fileNewPage, fileRevision } from './businessBrainFilingRuns';
import { fileSeveralPages } from './businessBrainBatchRuns';
import { businessBrainFileActions } from './businessBrainFileActions';
import { readIndex, readPage, searchBrain } from './businessBrainReadingRuns';
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
	}),
	moduleAction(businessBrainModule, {
		name: 'read_business_brain_index',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "list the pages of an organisation's Your Business Brain by part and title, with their ids, to choose which to read",
		guidance: readBusinessBrainIndexGuidance,
		inputSchema: readBusinessBrainIndexSchema,
		run: readIndex
	}),
	moduleAction(businessBrainModule, {
		name: 'search_business_brain',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "search the pages of an organisation's Your Business Brain for words, best match first, with an excerpt of each",
		guidance: searchBusinessBrainGuidance,
		inputSchema: searchBusinessBrainSchema,
		run: searchBrain
	}),
	moduleAction(businessBrainModule, {
		name: 'read_business_brain_page',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "read one page of an organisation's Your Business Brain whole, with its source, related pages and history, or one earlier version of it",
		guidance: readBusinessBrainPageGuidance,
		inputSchema: readBusinessBrainPageSchema,
		run: readPage
	}),
	...businessBrainFileActions,
	moduleAction(businessBrainModule, {
		name: 'file_business_brain_pages',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "file several new pages into an organisation's Your Business Brain in one call, such as every subject of a folder or a mail thread, each settled on its own",
		guidance: fileBusinessBrainPagesGuidance,
		inputSchema: fileBusinessBrainPagesSchema,
		run: fileSeveralPages
	})
];
