import {
	listMyChatbotsGuidance,
	readChatbotIndexGuidance,
	readChatbotPageGuidance,
	searchChatbotGuidance
} from './businessBrainChatbotGuidance';
import { listMyChatbotsSchema, readChatbotIndexSchema, readChatbotPageSchema, searchChatbotSchema } from './businessBrainChatbotSchemas';
import { listChatbotsToUse, readChatbotIndex, searchChatbot } from './chatbotReadingRuns';
import { readChatbotPage } from './chatbotPageRuns';
import { chatbotAction } from '../chatbotGate';
import type { McpAction } from '../actionTypes';

/** A person's Claude reading Your Business Brain through a chatbot it is named on: only what that chatbot covers, and only reading. */
export const chatbotReadingActions: McpAction[] = [
	{
		name: 'list_my_chatbots',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "list the chatbots onto an organisation's Your Business Brain you may use, with the parts of the brain each reads",
		guidance: listMyChatbotsGuidance,
		inputSchema: listMyChatbotsSchema,
		run: listChatbotsToUse
	},
	chatbotAction({
		name: 'read_chatbot_index',
		area: 'business_brain',
		audience: 'everyone',
		summary: 'list the pages a chatbot you may use reads, by part and title, with their ids, to choose which to read',
		guidance: readChatbotIndexGuidance,
		inputSchema: readChatbotIndexSchema,
		run: readChatbotIndex
	}),
	chatbotAction({
		name: 'search_chatbot',
		area: 'business_brain',
		audience: 'everyone',
		summary: 'search the pages a chatbot you may use reads for words, best match first, with an excerpt of each',
		guidance: searchChatbotGuidance,
		inputSchema: searchChatbotSchema,
		run: searchChatbot
	}),
	chatbotAction({
		name: 'read_chatbot_page',
		area: 'business_brain',
		audience: 'everyone',
		summary: 'read one page a chatbot you may use reads, whole, with its source, related pages and history, or one earlier version of it',
		guidance: readChatbotPageGuidance,
		inputSchema: readChatbotPageSchema,
		run: readChatbotPage
	})
];
