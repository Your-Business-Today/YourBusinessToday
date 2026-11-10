import { chatbotTrailLimits } from '$lib/data/businessBrainChatbotTrailRules';
import { objectSchema, textField } from '../actionTypes';
import { chatbotInputKey } from '../chatbotGate';
import { questionIdField } from '$lib/server/businessBrain/validateChatbotQuestion';
import { organisationField } from './businessBrainChatbotSchemas';

const { longestAnswer, mostPagesCited } = chatbotTrailLimits;

const pagesCitedField = {
	type: 'array',
	items: { type: 'string' },
	maxItems: mostPagesCited,
	description: 'The page id of every page you cited; leave empty when you cited none'
};

export const recordChatbotAnswerSchema = objectSchema(
	{
		[chatbotInputKey]: textField('The chatbot the question was asked through, as list_my_chatbots gives its id'),
		[questionIdField]: textField("The question on the chatbot's record, as its readings gave it"),
		answer: textField(`The answer you gave the person, word for word — at most ${longestAnswer} characters`),
		pagesCited: pagesCitedField
	},
	[chatbotInputKey, questionIdField, 'answer']
);

export const listBusinessBrainChatbotQuestionsSchema = objectSchema(
	{
		organisationId: organisationField,
		chatbotId: textField('Only the questions asked through this chatbot; leave out for every chatbot'),
		person: textField('Only the questions this person asked, by the email they sign in with; leave out for everyone'),
		fromDay: textField('Only questions asked on or after this day, UK time, written as 2026-11-30'),
		toDay: textField('Only questions asked on or before this day, UK time, written as 2026-11-30')
	},
	['organisationId']
);
