import { domainQuestionKindNames, domainQuestionsShown, type DomainQuestion } from '$lib/data/domainQuestions';
import { domainRunActionName } from './domainRunActionName';

/** The ranked questions the site found in the domain, the first twelve listed to be asked in order, with how many more wait. */
export function domainQuestionsSection(questions: DomainQuestion[]): string {
	if (questions.length === 0) return 'The domain passes every test of a complete model: ask only what the sources teach that is new.';
	const shown = questions.slice(0, domainQuestionsShown.inTheWalk);
	const heading =
		`**The domain fails ${questions.length} tests of a complete model.** Ask these in this order, one at a time, most important first; ` +
		'each answer filed closes its question, and what you conclude without being told is filed in the page’s assumed, never as fact:';
	const lines = shown.map((question, index) => `   ${index + 1}. ${question.question}`);
	return [heading, ...lines, ...moreQuestions(questions.length - shown.length)].join('\n');
}

function moreQuestions(moreCount: number): string[] {
	if (moreCount === 0) return [];
	return [`   And ${moreCount} more, which the next run lists once these are filed.`];
}

/** What filing answers of the domain's questions: how many are still open and the first three. */
export function openDomainQuestions(questions: DomainQuestion[]): string {
	if (questions.length === 0) return 'The domain passes every test of a complete model.';
	const firstQuestions = questions.slice(0, domainQuestionsShown.afterFiling).map((question, index) => `${index + 1}. ${question.question}`);
	return `${questions.length} questions are still open, most important first: ${firstQuestions.join(' ')} ${domainRunActionName} lists them all, in this order.`;
}

/** Every open question of the domain, in order, as the reading of the domain closes. */
export function domainQuestionsReading(questions: DomainQuestion[]): string {
	if (questions.length === 0) return '## Open questions\nNone: the domain passes every test of a complete model.';
	const lines = questions.map((question, index) => `${index + 1}. ${question.question} (${aboutOf(question)})`);
	return [`## Open questions (${questions.length})`, 'Most important first; ask them in this order.', ...lines].join('\n');
}

function aboutOf({ kind, about, areaTitle }: DomainQuestion): string {
	const area = areaTitle === null ? '' : `, ${areaTitle}`;
	return `${domainQuestionKindNames[kind]}: ${about}${area}`;
}

/** The domain's open questions in a line, as the workflow map run says them. */
export function domainQuestionCountLine(questionCount: number | null): string[] {
	if (questionCount === null) return [];
	if (questionCount === 0) return ['The domain passes every test of a complete model.'];
	return [`The domain has ${questionCount} questions open; ${domainRunActionName} asks them, once this map is filed.`];
}
