import { progressBetween } from './promoMotion';

export type ChatState = { question: string; isThinking: boolean; answer: string };

type ChatLine = { text: string; fromBeat: number; toBeat: number };

/** The demo portal's assistant, answered from the portal's own invented figures on the Owner Overview. */
export const assistantChat = {
	portalName: 'Build Portal',
	question: { text: 'Which jobs are losing money?', fromBeat: 8.5, toBeat: 10 },
	answer: {
		text: 'Two. Stonebridge Farmhouse is forecast £18,400 down, and The Old Coach House £21,300 down on the work left. Want the details?',
		fromBeat: 11,
		toBeat: 14.5
	}
};

function typedCharacters(line: ChatLine, appBeats: number): string {
	const { text } = line;
	const typed = progressBetween(appBeats, line.fromBeat, line.toBeat);
	return text.slice(0, Math.round(typed * text.length));
}

function streamedWords(line: ChatLine, appBeats: number): string {
	const words = line.text.split(' ');
	const streamed = progressBetween(appBeats, line.fromBeat, line.toBeat);
	return words.slice(0, Math.round(streamed * words.length)).join(' ');
}

/** What the phone shows at an app beat: the question being typed, the assistant thinking, then its answer arriving word by word. */
export function chatStateAt(appBeats: number): ChatState {
	const { question, answer } = assistantChat;
	const isThinking = appBeats >= question.toBeat && appBeats < answer.fromBeat;
	return { question: typedCharacters(question, appBeats), isThinking, answer: streamedWords(answer, appBeats) };
}
