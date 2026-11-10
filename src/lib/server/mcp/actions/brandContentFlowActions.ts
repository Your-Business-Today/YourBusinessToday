import { moduleAction } from '../organisationModuleGate';
import { recordPublication, reviewContent, scheduleContent, sendContentForApproval } from './brandContentFlowRuns';
import {
	recordPublicationSchema,
	reviewContentSchema,
	scheduleContentSchema,
	sendContentForApprovalSchema
} from './brandContentFlowSchemas';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';
const byHand = 'Nothing here posts to a social account: scheduling and posting stay by hand.';

/** Every connector action that takes a piece of brand content from drafted, through approval, to published. */
export const brandContentFlowActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'send_content_for_approval',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'send a drafted piece of the brand’s content to be approved',
		inputSchema: sendContentForApprovalSchema,
		run: sendContentForApproval
	}),
	moduleAction(brandModule, {
		name: 'review_content',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'approve a piece awaiting approval, ask for changes to it, or comment on any piece',
		guidance:
			'Asking for changes sends the piece back to drafted; approving moves it to approved. Only a piece awaiting ' +
			'approval is approved or sent back, and a comment leaves the piece where it is.',
		inputSchema: reviewContentSchema,
		run: reviewContent
	}),
	moduleAction(brandModule, {
		name: 'schedule_content',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'give an approved piece the date and time it goes out, or move a scheduled one',
		guidance: byHand,
		inputSchema: scheduleContentSchema,
		run: scheduleContent
	}),
	moduleAction(brandModule, {
		name: 'record_publication',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'record that an approved or scheduled piece went out, with the public link to it',
		guidance: byHand,
		inputSchema: recordPublicationSchema,
		run: recordPublication
	})
];
