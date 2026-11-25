const managersOnly = 'Only a manager of the organisation, or staff, does this, and only while Your Business Brain is switched on for it.';

export const deleteChatbotQuestionGuidance = [
	managersOnly,
	"Deletes one question from the organisation's chatbot record, with every reading made for it and the answer reported. It cannot be undone, so run it only on the manager's word, naming the question first.",
	'The deletion is itself recorded: who deleted it, when, which chatbot and when the question was asked, but not its words. list_business_brain_chatbot_record_deletions reads those.'
].join('\n');

export const setChatbotRecordKeepingGuidance = [
	managersOnly,
	"Sets how long the organisation keeps its chatbot record, in days after each question was asked. Leave keptDays out to keep it for as long as Your Business Brain is kept, which is how it starts.",
	'Every night, each question older than the period is deleted with its readings and answer, and each deletion is recorded. A shorter period deletes the older questions on the next night, so say so before setting it.'
].join('\n');

export const listChatbotRecordDeletionsGuidance = [
	managersOnly,
	"Says how long the organisation keeps its chatbot record, and lists the latest questions deleted from it, newest first: which chatbot, when each was asked and deleted, and by whom or because it passed the keeping period. The deleted words are never kept."
].join('\n');
