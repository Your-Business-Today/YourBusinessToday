import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { chatbotTrailLimits } from '$lib/data/businessBrainChatbotTrailRules';
import { businessBrainPartKinds } from '$lib/data/businessBrainRules';
import { objectSchema, textField } from '../actionTypes';
import { chatbotInputKey } from '../chatbotGate';
import { questionField, questionIdField } from '$lib/server/businessBrain/validateChatbotQuestion';
import { pageToReadField, partToListField, revisionToReadField, searchField } from './businessBrainSchemas';

const { longestName, longestEmail, mostPeopleAtOnce } = businessBrainChatbotLimits;
const { longestQuestion } = chatbotTrailLimits;

export const organisationField = textField('The organisation whose brain it is, as list_organisations gives it');
const chatbotField = textField('The chatbot, as making it or list_business_brain_chatbots gave its id');

const partListField = (description: string) => ({
	type: 'array',
	items: { type: 'string', enum: [...businessBrainPartKinds] },
	description
});

const peopleListField = (description: string) => ({
	type: 'array',
	items: { type: 'string', maxLength: longestEmail },
	maxItems: mostPeopleAtOnce,
	description: `${description}, by the email they sign in to Your Business Today with — at most ${mostPeopleAtOnce} at once`
});

export const makeBusinessBrainChatbotSchema = objectSchema(
	{
		organisationId: organisationField,
		name: textField(`What the chatbot is called, unique on the organisation — at most ${longestName} characters`),
		parts: partListField('The parts of the brain it may read; at least one'),
		people: peopleListField('The people who may use it; leave out to name them later')
	},
	['organisationId', 'name', 'parts']
);

export const changeBusinessBrainChatbotSchema = objectSchema(
	{
		organisationId: organisationField,
		chatbotId: chatbotField,
		addParts: partListField('Parts of the brain it may now read as well'),
		removeParts: partListField('Parts of the brain it may no longer read; it keeps at least one'),
		addPeople: peopleListField('People who may now use it as well'),
		removePeople: peopleListField('People who may no longer use it')
	},
	['organisationId', 'chatbotId']
);

export const listBusinessBrainChatbotsSchema = objectSchema({ organisationId: organisationField }, ['organisationId']);

const chatbotToReadThrough = textField('The chatbot to read through, as list_my_chatbots gives its id');

export const listMyChatbotsSchema = objectSchema({});

const questionAsked = {
	[questionField]: textField(`The person's question, in their own words as they asked it — at most ${longestQuestion} characters; it goes on the chatbot's record`),
	[questionIdField]: textField("The question already on the chatbot's record this reading carries on, as an earlier reading gave it; leave out for a new question")
};

const questionRead = [chatbotInputKey, questionField];

export const readChatbotIndexSchema = objectSchema({ [chatbotInputKey]: chatbotToReadThrough, ...questionAsked, part: partToListField }, questionRead);

export const searchChatbotSchema = objectSchema({ [chatbotInputKey]: chatbotToReadThrough, ...questionAsked, search: searchField }, [...questionRead, 'search']);

export const readChatbotPageSchema = objectSchema(
	{ [chatbotInputKey]: chatbotToReadThrough, ...questionAsked, pageId: pageToReadField, revisionId: revisionToReadField },
	[...questionRead, 'pageId']
);
