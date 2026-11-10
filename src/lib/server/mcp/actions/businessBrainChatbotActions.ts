import {
	changeBusinessBrainChatbotGuidance,
	listBusinessBrainChatbotsGuidance,
	makeBusinessBrainChatbotGuidance
} from './businessBrainChatbotGuidance';
import {
	changeBusinessBrainChatbotSchema,
	listBusinessBrainChatbotsSchema,
	makeBusinessBrainChatbotSchema
} from './businessBrainChatbotSchemas';
import { changeChatbot, listChatbots, makeChatbot } from './businessBrainChatbotRuns';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const businessBrainModule = 'business_brain';

export const businessBrainChatbotActions: McpAction[] = [
	moduleAction(businessBrainModule, {
		name: 'make_business_brain_chatbot',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "make a chatbot onto an organisation's Your Business Brain, as its manager: its name, the parts it may read and who may use it",
		guidance: makeBusinessBrainChatbotGuidance,
		inputSchema: makeBusinessBrainChatbotSchema,
		run: makeChatbot
	}),
	moduleAction(businessBrainModule, {
		name: 'change_business_brain_chatbot',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "change which parts of Your Business Brain a chatbot may read and who may use it, as the organisation's manager",
		guidance: changeBusinessBrainChatbotGuidance,
		inputSchema: changeBusinessBrainChatbotSchema,
		run: changeChatbot
	}),
	moduleAction(businessBrainModule, {
		name: 'list_business_brain_chatbots',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's chatbots onto Your Business Brain, as its manager: what each may read and who may use it",
		guidance: listBusinessBrainChatbotsGuidance,
		inputSchema: listBusinessBrainChatbotsSchema,
		run: listChatbots
	})
];
