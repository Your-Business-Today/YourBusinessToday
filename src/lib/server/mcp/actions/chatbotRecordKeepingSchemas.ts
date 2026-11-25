import { chatbotRecordKeepingLimits, keptDaysField } from '$lib/data/chatbotRecordKeepingRules';
import { objectSchema, textField } from '../actionTypes';
import { questionIdField } from '$lib/server/businessBrain/validateChatbotQuestion';
import { organisationField } from './businessBrainChatbotSchemas';

const { shortestKeptDays, longestKeptDays } = chatbotRecordKeepingLimits;

export const deleteChatbotQuestionSchema = objectSchema(
	{
		organisationId: organisationField,
		[questionIdField]: textField('The question to delete, as list_business_brain_chatbot_questions gives its id')
	},
	['organisationId', questionIdField]
);

export const setChatbotRecordKeepingSchema = objectSchema(
	{
		organisationId: organisationField,
		[keptDaysField]: {
			type: 'integer',
			minimum: shortestKeptDays,
			maximum: longestKeptDays,
			description: `How many days each question is kept after it was asked, ${shortestKeptDays} to ${longestKeptDays}; leave out to keep the record for as long as Your Business Brain is kept`
		}
	},
	['organisationId']
);

export const listChatbotRecordDeletionsSchema = objectSchema(
	{
		organisationId: organisationField,
		chatbotId: textField('Only the deletions from this chatbot’s record; leave out for every chatbot')
	},
	['organisationId']
);
