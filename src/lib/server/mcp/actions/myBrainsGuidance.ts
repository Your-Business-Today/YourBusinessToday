const whatItSearches =
	'Searches every brain you reach at once and says which hold something on the words, most pages first: the whole Your Business Brain of each ' +
	'organisation you are on, the brain of each product you are on that has parts tied to it, and each named brain (chatbot) that names you, with what it is for.';

const whereToGoNext =
	'Use it first when you do not know which brain answers the question. Then read the pages that bear on it with the action each brain names, ' +
	'and answer only from what they say. Where no brain holds anything on it, say so plainly; never fill the gap from general knowledge.';

const whatIsRecorded =
	"The question goes on the record of every chatbot searched, as a search through that chatbot would; carry on with its questionId and record your answer with record_chatbot_answer. Your Business Today calls no AI model.";

export const searchMyBrainsGuidance = [whatItSearches, whereToGoNext, whatIsRecorded].join('\n');
