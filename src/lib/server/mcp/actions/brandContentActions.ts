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
			'draft a piece of the brand’s content for one medium, or change one still a draft: its title, hook, script, storyboard, caption and the action it invites',
		guidance:
			'Call resolve_brand for the medium first and write to its brief. The piece keeps a snapshot of the brand as it holds ' +
			'for that medium now, and starts at drafted. A new piece is one of the brand’s kinds of post; a kind it does not keep ' +
			'is refused by name. To change a piece, such as "change the caption", give its contentPieceId and only what changes: ' +
			'what you give takes the place of what it keeps, what you leave out stays, and it keeps its medium, day and post, and its kind unless you give another. ' +
			'An idea is written up this way on its planned day. A piece awaiting approval is refused: ask for changes with ' +
			'review_content, which sends it back to drafted, then draft it again. One approved, scheduled or published is not changed. ' +
			'To make a video from footage the brand already has, give each shot the clipItemId of a photo or video from ' +
			'list_brand_library, its words on screen (overline, onScreenText as the headline, underline) and wordsAt, and give a ' +
			'video piece the musicItemId of a piece of music; read_content of another piece shows its shots to reuse. Each item ' +
			'must be in this brand’s library, arrived and allowed to be posted. ' +
			'A value that does not fit its column is refused by name and nothing is kept.',
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
