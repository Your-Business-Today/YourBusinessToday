import { deleteChatbotQuestionGuidance, listChatbotRecordDeletionsGuidance, setChatbotRecordKeepingGuidance } from './chatbotRecordKeepingGuidance';
import { deleteChatbotQuestionSchema, listChatbotRecordDeletionsSchema, setChatbotRecordKeepingSchema } from './chatbotRecordKeepingSchemas';
import { deleteQuestionFromRecord, listRecordDeletions, setRecordKeeping } from './chatbotRecordKeepingRuns';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

/** A business deletes entries from its chatbot record and sets how long it is kept, and reads what was deleted. */
export const chatbotRecordKeepingActions: McpAction[] = [
	moduleAction('business_brain', {
		name: 'delete_business_brain_chatbot_question',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "delete one question from an organisation's chatbot record, with its readings and answer, as its manager; the deletion is recorded",
		guidance: deleteChatbotQuestionGuidance,
		inputSchema: deleteChatbotQuestionSchema,
		run: deleteQuestionFromRecord
	}),
	moduleAction('business_brain', {
		name: 'set_business_brain_chatbot_record_keeping',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "set how many days an organisation's chatbot record keeps each question, or for as long as its Your Business Brain is kept",
		guidance: setChatbotRecordKeepingGuidance,
		inputSchema: setChatbotRecordKeepingSchema,
		run: setRecordKeeping
	}),
	moduleAction('business_brain', {
		name: 'list_business_brain_chatbot_record_deletions',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "read how long an organisation's chatbot record is kept and the questions deleted from it, as its manager",
		guidance: listChatbotRecordDeletionsGuidance,
		inputSchema: listChatbotRecordDeletionsSchema,
		run: listRecordDeletions
	})
];
