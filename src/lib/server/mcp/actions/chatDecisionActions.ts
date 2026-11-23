import { closeChatDecision } from '$lib/server/chat/closeChatDecision';
import { listChatDecisionsAsked } from '$lib/server/chat/listChatDecisionsAsked';
import { raiseChatDecision } from '$lib/server/chat/raiseChatDecision';
import { moduleAction } from '../organisationModuleGate';
import { readText, type McpAction } from '../actionTypes';
import { chatAuthorOf, chatKeeperOf } from './chatConnectorCaller';
import { chatConnectorRefusal } from './chatConnectorRefusals';
import { chatDecisionClosingSchema, chatDecisionListingSchema, chatDecisionRaisingSchema } from './chatDecisionFields';
import { chatDecisionGuidance } from './chatDecisionGuidance';
import { describeClosedDecision, describeRaisedDecision } from './describeChatDecision';
import { describeChatDecisions } from './describeChatDecisions';

const inTheChat = { area: 'chat', audience: 'everyone' } as const;

export const chatDecisionActions: McpAction[] = [
	moduleAction('chat', {
		name: 'list_chat_decisions',
		...inTheChat,
		isWrite: false,
		summary: "list the decisions raised in an organisation's chat, or one room of it, open first, saying which wait on you",
		guidance: chatDecisionGuidance.list,
		inputSchema: chatDecisionListingSchema,
		run: async (caller, input, organisation) => {
			const listing = await listChatDecisionsAsked(caller.supabase, organisation.id, input);
			if (typeof listing === 'string') return chatConnectorRefusal(listing);
			return describeChatDecisions(organisation.name, listing, caller.accountId);
		}
	}),
	moduleAction('chat', {
		name: 'raise_chat_decision',
		...inTheChat,
		isWrite: true,
		summary: "raise a decision from a message in a room of an organisation's chat, waiting on the person named, as raised through their Claude",
		guidance: chatDecisionGuidance.raise,
		inputSchema: chatDecisionRaisingSchema,
		run: async (caller, input, organisation) => {
			const raised = await raiseChatDecision(caller.supabase, chatAuthorOf(caller, organisation), readText(input, 'roomId'), input);
			if (typeof raised === 'string') return chatConnectorRefusal(raised);
			return describeRaisedDecision(organisation.name, raised);
		}
	}),
	moduleAction('chat', {
		name: 'close_chat_decision',
		...inTheChat,
		isWrite: true,
		summary: "close an open decision of an organisation's chat with its outcome, never to be reopened",
		guidance: chatDecisionGuidance.close,
		inputSchema: chatDecisionClosingSchema,
		run: async (caller, input, organisation) => {
			const closed = await closeChatDecision(caller.supabase, chatKeeperOf(caller, organisation), input);
			if (typeof closed === 'string') return chatConnectorRefusal(closed);
			return describeClosedDecision(organisation.name, closed);
		}
	})
];
