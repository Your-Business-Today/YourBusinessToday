import { DocumentLimits } from './documentLimits';
import { checkRequiredWords, type FieldCheck } from '$lib/data/fieldChecks';

const { longestQuestion, longestAnswer } = DocumentLimits;

export const questionRefusal = `question is what you want their input on: required, at most ${longestQuestion} characters`;
export const answerRefusal = `answer is their input: required, at most ${longestAnswer} characters`;
export const askedOfRefusal = 'askedOf is the person asked: their account id, email or name, as read_organisation or list_project_people gives it';

/** The question an input request asks, checked against its column. */
export function checkQuestion(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestQuestion, questionRefusal);
}

/** The input given in answer, checked against its column. */
export function checkAnswer(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestAnswer, answerRefusal);
}

/** The person asked, as named: an id, an email or a name to be found among the people on the document's owner. */
export function checkAskedOf(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestQuestion, askedOfRefusal);
}
