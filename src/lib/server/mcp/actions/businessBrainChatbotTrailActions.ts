import { listBusinessBrainChatbotQuestionsGuidance, recordChatbotAnswerGuidance } from './businessBrainChatbotTrailGuidance';
import { listBusinessBrainChatbotQuestionsSchema, recordChatbotAnswerSchema } from './businessBrainChatbotTrailSchemas';
import { listChatbotQuestions, recordAnswer } from './businessBrainChatbotTrailRuns';
import { recordAnswerAction } from './describeChatbotTrail';
import { chatbotRecordAction } from '../chatbotGate';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

/** The record of every question asked through a chatbot: the answer a person's Claude reports, and the manager's reading of it. */
export const chatbotTrailActions: McpAction[] = [
	chatbotRecordAction({
		name: recordAnswerAction,
		area: 'business_brain',
		audience: 'everyone',
		summary: "record on a chatbot's record the answer you gave a question asked through it, with the pages you cited",
		guidance: recordChatbotAnswerGuidance,
		inputSchema: recordChatbotAnswerSchema,
		run: recordAnswer
	}),
	moduleAction('business_brain', {
		name: 'list_business_brain_chatbot_questions',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read every question asked through an organisation's chatbots, as its manager: who asked and when, what was read and the answer reported, by chatbot, person and days",
		guidance: listBusinessBrainChatbotQuestionsGuidance,
		inputSchema: listBusinessBrainChatbotQuestionsSchema,
		run: listChatbotQuestions
	})
];
