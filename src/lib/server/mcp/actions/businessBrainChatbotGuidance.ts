const whatAChatbotIs =
	"A chatbot is a named, read-only door onto part of an organisation's Your Business Brain. The people a manager names " +
	'reach it through their own Claude, which does the asking: Your Business Today calls no AI model, and there are no credits or allowances.';

const whoMakesThem = 'Only a manager of the organisation, or staff, makes or changes a chatbot, and only while Your Business Brain is switched on for it.';

const whatItReads =
	'Give it only the parts of the brain its people need: expertise, experience, process or people. A chatbot reads at least one part.';

const whoUsesIt =
	'Name each person who may use it by the email they sign in to Your Business Today with; they need not be on the organisation. ' +
	'Ask the person you are working with before naming anyone outside it.';

const nothingIsDeleted =
	'Taking a part or a person away dates their row rather than deleting it, so who could read what, and when, stays on record.';

export const makeBusinessBrainChatbotGuidance = [whatAChatbotIs, whoMakesThem, whatItReads, whoUsesIt].join('\n');

export const changeBusinessBrainChatbotGuidance = [
	whoMakesThem,
	whatItReads,
	whoUsesIt,
	nothingIsDeleted,
	'Only what is not already so is changed: a part it already reads or a person already on it is left as it is.'
].join('\n');

export const listBusinessBrainChatbotsGuidance = [whatAChatbotIs, whoMakesThem].join('\n');
