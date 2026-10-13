/**
 * The words of the kit's widget notation: a widget or a site part by name, a repeat such as (n) or (3), a
 * condition such as ?isNew:, and the brackets and separators that arrange them.
 */
export const tokenKinds = { name: 'name', repeat: 'repeat', condition: 'condition', mark: 'mark' } as const;

export type NotationToken =
	| { kind: 'name'; name: string; isPart: boolean; isHandWritten: boolean }
	| { kind: 'repeat'; count: string }
	| { kind: 'condition'; text: string }
	| { kind: 'mark'; mark: string };

export type MarkToken = Extract<NotationToken, { kind: 'mark' }>;

export const closerOfOpener: Record<string, string> = { '{': '}', '(': ')', '[': ']' };

const marks = new Set(['{', '}', '[', ']', '(', ')', ',', '|']);
const repeatPattern = /^\((\d+|n)\)/;
const namePattern = /^[A-Za-z_][\w.]*/;
const handWrittenPattern = /^⚠[^→\s]*→([A-Za-z_][\w.]*)/;
const conditionEnd = /: (?=[A-Z([⚠?])/;
const conditionStart = '?';
const partMark = '=';

type Reading = { token: NotationToken | null; length: number };

export function tokeniseNotation(notation: string): NotationToken[] {
	const tokens: NotationToken[] = [];
	let position = 0;
	while (position < notation.length) {
		const reading = readToken(notation.slice(position));
		if (reading.token !== null) tokens.push(reading.token);
		position += reading.length;
	}
	return tokens;
}

function readToken(rest: string): Reading {
	const first = rest[0];
	const repeat = repeatPattern.exec(rest);
	if (repeat !== null) return { token: { kind: tokenKinds.repeat, count: repeat[1] }, length: repeat[0].length };
	if (marks.has(first)) return { token: { kind: tokenKinds.mark, mark: first }, length: 1 };
	if (first === conditionStart) return readCondition(rest);
	const handWritten = handWrittenPattern.exec(rest);
	if (handWritten !== null) return nameReading(handWritten[1], handWritten[0].length, true);
	const name = namePattern.exec(rest);
	if (name === null) return { token: null, length: 1 };
	const isPart = rest[name[0].length] === partMark;
	const token: NotationToken = { kind: tokenKinds.name, name: name[0], isPart, isHandWritten: false };
	return { token, length: name[0].length + (isPart ? 1 : 0) };
}

function nameReading(name: string, length: number, isHandWritten: boolean): Reading {
	return { token: { kind: tokenKinds.name, name, isPart: false, isHandWritten }, length };
}

/** A condition runs to the colon that a widget, a bracket or another condition follows. */
function readCondition(rest: string): Reading {
	const end = conditionEnd.exec(rest);
	if (end === null) return { token: null, length: rest.length };
	const text = rest.slice(1, end.index).trim();
	return { token: { kind: tokenKinds.condition, text }, length: end.index + end[0].length };
}

export function isMark(token: NotationToken, mark: string | null): boolean {
	return mark !== null && token.kind === tokenKinds.mark && token.mark === mark;
}

export function isOpener(token: NotationToken): token is MarkToken {
	return token.kind === tokenKinds.mark && token.mark in closerOfOpener;
}

export function isCloserOrSeparator(token: NotationToken): boolean {
	return token.kind === tokenKinds.mark && !isOpener(token);
}

export function isPrefix(token: NotationToken): boolean {
	return token.kind === tokenKinds.repeat || token.kind === tokenKinds.condition;
}
