import { chatbotTrailLimits } from '$lib/data/businessBrainChatbotTrailRules';
import { objectSchema, textField } from '../actionTypes';
import { questionField } from '$lib/server/businessBrain/validateChatbotQuestion';
import { searchField } from './businessBrainSchemas';

const { longestQuestion } = chatbotTrailLimits;

export const searchMyBrainsSchema = objectSchema(
	{
		[questionField]: textField(`The person's question, in their own words as they asked it — at most ${longestQuestion} characters; it goes on the record of every chatbot searched`),
		search: searchField,
		organisationId: textField('One organisation whose brains alone to search, as list_organisations gives it; leave out to search every brain you reach')
	},
	[questionField, 'search']
);
