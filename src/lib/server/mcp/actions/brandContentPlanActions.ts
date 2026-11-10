import { moduleAction } from '../organisationModuleGate';
import { moveContentToDay, planContentIdea, readContentPlan } from './brandContentPlanRuns';
import { moveContentToDaySchema, planContentIdeaSchema, readContentPlanSchema } from './brandContentPlanSchemas';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** Every connector action on the month's plan of a brand's content: reading it, writing an idea onto a day, and moving a piece. */
export const brandContentPlanActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'read_content_plan',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'one month of the brand’s content, week by week, on the day each piece goes out, with the counts and kinds of post above it',
		guidance:
			'A piece sits on the day it is scheduled for once it is scheduled, otherwise on the day it is planned for. ' +
			'Days with nothing on them are listed too, so the gaps show.',
		inputSchema: readContentPlanSchema,
		run: readContentPlan
	}),
	moduleAction(brandModule, {
		name: 'plan_content_idea',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'write an idea down for the day and time it goes out, before any script exists',
		guidance:
			'The idea starts at idea with its medium, its kind of post, working title and opening line. The kind is one the brand ' +
			'keeps, or the starter list while it keeps none, so the month has a mix. Write it up later with draft_content, ' +
			'giving its contentPieceId; it keeps its day. A value that does not fit its column is refused by name.',
		inputSchema: planContentIdeaSchema,
		run: planContentIdea
	}),
	moduleAction(brandModule, {
		name: 'move_content_to_day',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'move a piece of the brand’s content to another day and time on the plan',
		guidance: 'A scheduled piece’s scheduled day moves with it. A published piece has gone out and is not moved.',
		inputSchema: moveContentToDaySchema,
		run: moveContentToDay
	})
];
