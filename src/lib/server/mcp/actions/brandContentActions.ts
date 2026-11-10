import { draftContent, listContent, readContent } from './brandContentRuns';
import { draftContentSchema, listContentSchema, readContentSchema } from './brandContentSchemas';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** Every connector action on an organisation's brand content: what a person's Claude drafts, lists and reads. */
export const brandContentActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'draft_content',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary:
			'draft a piece of the brand’s content for one medium: its title, hook, script, storyboard, caption and the action it invites',
		guidance:
			'Call resolve_brand for the medium first and write to its brief. The piece keeps a snapshot of the brand as it holds ' +
			'for that medium now, and starts at drafted. A value that does not fit its column is refused by name and nothing is kept.',
		inputSchema: draftContentSchema,
		run: draftContent
	}),
	moduleAction(brandModule, {
		name: 'list_content',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'the brand’s content pieces, newest first, or only those at one stage',
		inputSchema: listContentSchema,
		run: listContent
	}),
	moduleAction(brandModule, {
		name: 'read_content',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'one piece of the brand’s content in full, with the brand as it held when drafted and every review',
		inputSchema: readContentSchema,
		run: readContent
	})
];
