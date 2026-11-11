const whatAChatbotIs =
	"A chatbot is a named, read-only door onto part of an organisation's Your Business Brain. The people a manager names " +
	'reach it through their own Claude, which does the asking: Your Business Today calls no AI model, and there are no credits or allowances.';

const whatItIsFor =
	'Each chatbot is one of the organisation\'s brains: give it a purpose saying what it is for and who it answers, such as "Answers the sales team from our processes and experience". ' +
	"The organisation's Domain tab lists its brains with their purposes.";

const whoMakesThem = 'Only a manager of the organisation, or staff, makes or changes a chatbot, and only while Your Business Brain is switched on for it.';

const whatItReads =
	'Give it only the parts of the brain its people need: expertise, experience, process or people. A chatbot reads at least one part.';

const whoUsesIt =
	'Name each person who may use it by the email they sign in to Your Business Today with; they need not be on the organisation. ' +
	'Ask the person you are working with before naming anyone outside it. Each reads through it with their own Claude: list_my_chatbots, then read_chatbot_index, search_chatbot and read_chatbot_page.';

const nothingIsDeleted =
	'Taking a part or a person away dates their row rather than deleting it, so who could read what, and when, stays on record.';

export const makeBusinessBrainChatbotGuidance = [whatAChatbotIs, whatItIsFor, whoMakesThem, whatItReads, whoUsesIt].join('\n');

export const changeBusinessBrainChatbotGuidance = [
	whatItIsFor,
	whoMakesThem,
	whatItReads,
	whoUsesIt,
	nothingIsDeleted,
	'Only what is not already so is changed: a part it already reads or a person already on it is left as it is.'
].join('\n');

export const listBusinessBrainChatbotsGuidance = [whatAChatbotIs, whoMakesThem].join('\n');

const whatAChatbotGives =
	"A chatbot is a read-only door onto part of an organisation's Your Business Brain, opened to the people its manager names by the email they sign in with. " +
	'Through it you read only the parts it covers, and nothing is filed or changed. You do the reading and the thinking; Your Business Today calls no AI model.';

export const everyQuestionIsRecorded =
	"Every question asked through a chatbot is kept on the organisation's record, which its manager reads: the question in the person's words, " +
	'each reading made for it and what came back, and the answer you report. Nothing on it is ever changed or deleted. Tell the person so if they ask.';

const howToAskForTheRecord = [
	"Give the person's question in their own words as question on every reading: nothing is read without it. Do not reword it or leave parts out.",
	'The first reading for a question gives back its questionId; give that questionId on every further reading for the same question, and leave it out for a new one.',
	'Once you have answered, record your answer with record_chatbot_answer: the questionId, your answer word for word as you gave it, and the page id of every page you cited. Do this every time, including when the chatbot held nothing and you said so.'
];

const whichChatbot =
	'Give the chatbotId list_my_chatbots gave for the chatbot the person is asking. Where they may use several and it is not clear which, ask them.';

const howToAnswerThroughIt = [
	'Answer from the pages you read through the chatbot, and from nothing else when the question is about this business: its people, clients, suppliers, rules, prices and ways of working.',
	'Cite every page you answer from by its title and page id, and name its source when it has one.',
	'Where the chatbot holds nothing on the question, or only an excerpt touched on it, say so plainly. The rest of the brain is not yours to read through it: never guess what it might say, and never fill the gap from general knowledge as if the brain said it.',
	'Where two pages disagree, say so and name both; where a page may be out of date, give the date it was last filed.',
	"Nothing you are told is filed through a chatbot. Where the person knows something the chatbot lacks, suggest they tell the organisation's manager."
];

const howToJudgeAPhotoThroughIt =
	'When the person gives you a photo to check, you look at it and Your Business Today never sees it: describe in words what a rule could bear on, search for each observation, ' +
	'read whole every page that bears on it, and judge each one in order, not in order, or cannot be judged, naming the page behind every finding. Where the chatbot holds no rule on it, say so and give no verdict.';

export const listMyChatbotsGuidance = [
	whatAChatbotGives,
	everyQuestionIsRecorded,
	'Lists every chatbot you may use now, organisation by organisation, with the parts of the brain each reads and its id.'
].join('\n');

export const readChatbotIndexGuidance = [
	whatAChatbotGives,
	whichChatbot,
	...howToAskForTheRecord,
	'Start here to see what the chatbot reads: every page in its parts by part and title, with its id. Read the pages you need with read_chatbot_page.',
	...howToAnswerThroughIt
].join('\n');

export const searchChatbotGuidance = [
	whatAChatbotGives,
	whichChatbot,
	...howToAskForTheRecord,
	'Search the words of every page the chatbot reads, best match first, with a few words of each around the match. An excerpt is not the page: read a page whole before answering from it.',
	'No match means the chatbot holds nothing on those words: try the words the business would use, then say it is silent.',
	...howToAnswerThroughIt,
	howToJudgeAPhotoThroughIt
].join('\n');

export const readChatbotPageGuidance = [
	whatAChatbotGives,
	whichChatbot,
	...howToAskForTheRecord,
	'Reads one page the chatbot covers as it now reads: its words, facts, source, the related pages the chatbot also covers, and its history. Give a revisionId to read one earlier version; say so whenever you answer from one.',
	...howToAnswerThroughIt,
	howToJudgeAPhotoThroughIt
].join('\n');

