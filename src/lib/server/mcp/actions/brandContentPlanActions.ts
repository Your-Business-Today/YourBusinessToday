import { moduleAction } from '../organisationModuleGate';
import { approveContentMonth, moveContentToDay, planContentIdea, readContentPlan } from './brandContentPlanRuns';
import {
	approveContentMonthSchema,
	moveContentToDaySchema,
	planContentIdeaSchema,
	readContentPlanSchema
} from './brandContentPlanSchemas';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/**
 * Every connector action on the month's plan of a brand's content: reading it, writing an idea onto a day, moving a
 * piece, and approving the month's pieces together.
 */
export const brandContentPlanActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'read_content_plan',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary:
			'one month of the brand’s content, week by week, on the day each piece goes out, with the counts, kinds of post ' +
			'and posting rhythm above it; read it before planning a month',
		guidance:
			'A piece sits on the day it is scheduled for once it is scheduled, otherwise on the day it is planned for. ' +
			'Days with nothing on them are listed too, so the gaps show. Each week gives its posts against the number the ' +
			'rhythm makes due, marks the posting days of a short week that have nothing on them, and marks a post planned ' +
			'outside the rhythm as extra.',
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
			'keeps, or the starter list while it keeps none, so the month has a mix. Put it on a posting day at the posting ' +
			'time read_content_plan gives; a day outside the rhythm is still kept and shows as extra. Write it up later with draft_content, ' +
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
	}),
	moduleAction(brandModule, {
		name: 'approve_content_month',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'approve together every piece of a month waiting for approval that the client was shown',
		guidance:
			'Read the month with read_content_plan first and show the client each caption and picture under Waiting for ' +
			'approval; then give every piece they approve with its id and updatedAt exactly as read. Each is approved on its ' +
			'own and kept as a review by the caller: one that has changed since it was read, has moved on, or is not in the ' +
			'month is left as it is and named with the reason, and never undoes the others. A post still waiting on its ' +
			'picture is approved with its picture described. To ask for a change to one post, use review_content on its piece instead.',
		inputSchema: approveContentMonthSchema,
		run: approveContentMonth
	})
];
