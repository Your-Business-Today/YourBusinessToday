import { describe, expect, it } from 'vitest';
import { assistantChat, chatStateAt } from './assistantChat';

const { question, answer } = assistantChat;
const { text: questionText } = question;
const { text: answerText } = answer;
const emptyChat = { question: '', isThinking: false, answer: '' };

function middleOf(line: { fromBeat: number; toBeat: number }): number {
	return (line.fromBeat + line.toBeat) / 2;
}

describe('the assistant on the phone', () => {
	it('starts with an empty conversation', () => {
		expect(chatStateAt(0)).toEqual(emptyChat);
	});

	it('types the question out letter by letter', () => {
		const { question: typed } = chatStateAt(middleOf(question));
		expect(questionText.startsWith(typed)).toBe(true);
		expect(typed.length).toBeGreaterThan(0);
		expect(typed.length).toBeLessThan(questionText.length);
	});

	it('thinks between the question and the answer', () => {
		expect(chatStateAt(question.toBeat)).toEqual({ question: questionText, isThinking: true, answer: '' });
	});

	it('streams the answer in whole words until all of it is there', () => {
		const { answer: streamed } = chatStateAt(middleOf(answer));
		const { answer: finished, isThinking } = chatStateAt(answer.toBeat);
		expect(answerText.startsWith(streamed)).toBe(true);
		expect(streamed.endsWith(' ')).toBe(false);
		expect(finished).toBe(answerText);
		expect(isThinking).toBe(false);
	});
});
