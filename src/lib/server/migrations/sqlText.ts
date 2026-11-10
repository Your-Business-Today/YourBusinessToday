import { SqlTokens } from './sqlTokens';

const notFound = -1;
const collapsedSpace = ' ';
const runsOfWhitespace = /\s+/g;
const dollarQuote = /\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/y;

/** The text with every run of whitespace made one space, trimmed. */
export const collapse = (text: string) => text.replace(runsOfWhitespace, collapsedSpace).trim();

/** Where the text just past the next `closing` at or after `searchFrom` begins, or the end of the text. */
export const endOf = (sql: string, closing: string, searchFrom: number): number => {
	const closingAt = sql.indexOf(closing, searchFrom);
	return closingAt === notFound ? sql.length : closingAt + closing.length;
};

/** Where the text just past the single-quoted string opening at `opening` begins, stepping over doubled quotes. */
export const endOfString = (sql: string, opening: number): number => {
	let end = endOf(sql, SqlTokens.quote, opening + 1);
	while (sql.startsWith(SqlTokens.quote, end)) end = endOf(sql, SqlTokens.quote, end + 1);
	return end;
};

/** The dollar-quote tag (`$$` or `$name$`) opening at `position`, if one does. */
export const dollarTagAt = (sql: string, position: number): string | undefined => {
	dollarQuote.lastIndex = position;
	return dollarQuote.exec(sql)?.[0];
};

/** The line `offset` falls on, counting the text's first line as `startingLine`. */
export const lineAt = (sql: string, offset: number, startingLine: number): number =>
	startingLine + sql.slice(0, offset).split(SqlTokens.newLine).length - 1;
