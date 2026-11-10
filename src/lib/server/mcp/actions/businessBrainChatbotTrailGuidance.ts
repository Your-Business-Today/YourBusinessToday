import { everyQuestionIsRecorded } from './businessBrainChatbotGuidance';

const howLongItIsKept =
	"The record is kept for as long as the organisation's Your Business Brain is kept, and nothing in the app deletes it.";

export const recordChatbotAnswerGuidance = [
	everyQuestionIsRecorded,
	'Record the answer you gave the person once you have given it, under the questionId the readings gave: word for word, with the page id of every page you cited, or none.',
	'Record it every time, including when the chatbot held nothing and you said so. A question takes one answer and it is never changed: to answer again, ask it again as a new question.'
].join('\n');

export const listBusinessBrainChatbotQuestionsGuidance = [
	'Only a manager of the organisation, or staff, reads the questions asked through its chatbots, and only while Your Business Brain is switched on for it.',
	"Lists every question asked through the organisation's chatbots, latest first: who asked and when, every reading made for it as Your Business Today saw it, and the answer the person's Claude reported, or that none was.",
	'A cited page that no reading for the question gave back is marked, so an answer that claims a page the chatbot never gave shows as such.',
	'Narrow it by chatbot, by person (the email they sign in with) and by days, UK time.',
	howLongItIsKept
].join('\n');
