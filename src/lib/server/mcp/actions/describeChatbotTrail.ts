import { countOf } from '$lib/data/countOf';
import { brainOf } from './businessBrainAnswers';
import { questionLines } from './describeChatbotQuestion';
import type { ChatbotQuestionTrail } from '$lib/server/businessBrain/readChatbotQuestionTrail';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const recordAnswerAction = 'record_chatbot_answer';

export const noSuchQuestionOfYours =
	'You asked no question by that questionId through this chatbot. Leave questionId out to ask a new one; it is put on the record in your words.';

export const answerAlreadyOnRecord =
	"An answer to that question is already on the chatbot's record, and the record is never changed. To answer again, ask it again without the questionId.";

export const trailNotReadyYet =
	"The record of questions asked through chatbots starts once this release's database change has run. Until then nothing is read through a chatbot, so there is nothing on it.";

/** A reading's answer with where it was kept on the chatbot's record and what to do next with that question. */
export function withTrailNote(answer: string, questionId: string): string {
	const note = [
		'---',
		`Kept on the chatbot's record as question ${questionId}. Give questionId ${questionId} on every further reading for this same question.`,
		`Once you have answered the person, record your answer with ${recordAnswerAction}: questionId ${questionId}, your answer as you gave it and the page ids you cited.`
	];
	return [answer, '', ...note].join('\n');
}

/** Says the answer is on the record, and that it stays as written. */
export function answerRecorded(questionId: string, pagesCitedCount: number): string {
	const cited = countOf(pagesCitedCount, 'page');
	return `Your answer to question ${questionId} is on the chatbot's record, citing ${cited}. It is kept as written and never changed.`;
}

/** The questions a manager asked for, latest first, each with what was read for it and the answer reported. */
export function describeChatbotTrail(organisation: Organisation, trail: ChatbotQuestionTrail, chatbotNames: Map<string, string>): string {
	const { questions, questionCount } = trail;
	if (questionCount === 0) return `No question asked through a chatbot onto ${brainOf(organisation)} matches.`;
	const heading = `# ${countOf(questionCount, 'question')} asked through chatbots onto ${brainOf(organisation)}, latest first`;
	const key =
		'Each reading is as Your Business Today saw it for itself. The question in words and the answer are as the person’s Claude gave and reported them.';
	const unlisted = questionCount - questions.length;
	const cutNote = unlisted > 0 ? ['', `Not listed: ${countOf(unlisted, 'earlier question')}. Narrow by chatbot, person or days to see them.`] : [];
	const sections = questions.flatMap((question) => questionLines(question, chatbotNames));
	return [heading, '', key, ...sections, ...cutNote].join('\n');
}
