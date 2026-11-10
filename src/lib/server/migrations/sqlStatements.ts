import type { SqlBody, SqlStatement } from './sqlStatement';
import { collapse, dollarTagAt, endOf, endOfString, lineAt } from './sqlText';
import { SqlTokens } from './sqlTokens';

const firstLine = 1;
const skippedText = ' ';
const { blockCommentOpen } = SqlTokens;
const blockCommentOpenLength = blockCommentOpen.length;

class StatementScanner {
	private position = 0;
	private statementStart = 0;
	private isBetweenStatements = true;
	private code = '';
	private bodies: SqlBody[] = [];
	private readonly statements: SqlStatement[] = [];

	constructor(
		private readonly sql: string,
		private readonly startingLine: number
	) {}

	scan(): SqlStatement[] {
		while (this.position < this.sql.length) this.scanNext();
		this.endStatement();
		return this.statements;
	}

	private readonly openers: { token: string; scan: () => void }[] = [
		{ token: SqlTokens.lineComment, scan: () => this.skipTo(endOf(this.sql, SqlTokens.newLine, this.position)) },
		{ token: SqlTokens.blockCommentOpen, scan: () => this.skipTo(this.endOfBlockComment()) },
		{ token: SqlTokens.quote, scan: () => this.blankTo(endOfString(this.sql, this.position)) },
		{ token: SqlTokens.identifierQuote, scan: () => this.copyTo(this.endOfIdentifier()) },
		{ token: SqlTokens.statementEnd, scan: () => this.endStatement() }
	];

	private scanNext(): void {
		const opener = this.openers.find(({ token }) => this.sql.startsWith(token, this.position));
		if (opener !== undefined) return opener.scan();
		const tag = dollarTagAt(this.sql, this.position);
		if (tag !== undefined) return this.setBodyAside(tag);
		this.copyTo(this.position + 1);
	}

	private endOfBlockComment(): number {
		return endOf(this.sql, SqlTokens.blockCommentClose, this.position + blockCommentOpenLength);
	}

	private endOfIdentifier(): number {
		return endOf(this.sql, SqlTokens.identifierQuote, this.position + 1);
	}

	private skipTo(end: number): void {
		this.code += skippedText;
		this.position = end;
	}

	private blankTo(end: number): void {
		this.code += SqlTokens.blankString;
		this.position = end;
	}

	private copyTo(end: number): void {
		const copied = this.sql.slice(this.position, end);
		const isFirstOfStatement = this.isBetweenStatements && collapse(copied) !== '';
		if (isFirstOfStatement) this.statementStart = this.position;
		if (isFirstOfStatement) this.isBetweenStatements = false;
		this.code += copied;
		this.position = end;
	}

	private setBodyAside(tag: string): void {
		const bodyStart = this.position + tag.length;
		const end = endOf(this.sql, tag, bodyStart);
		const body = this.sql.slice(bodyStart, Math.max(bodyStart, end - tag.length));
		this.bodies.push({ sql: body, line: lineAt(this.sql, bodyStart, this.startingLine) });
		this.code += SqlTokens.blankBody;
		this.position = end;
	}

	private endStatement(): void {
		const text = collapse(this.sql.slice(this.statementStart, this.position));
		const code = collapse(this.code);
		const line = lineAt(this.sql, this.statementStart, this.startingLine);
		if (code !== '') this.statements.push({ code, text, line, bodies: this.bodies });
		this.position += 1;
		this.isBetweenStatements = true;
		this.code = '';
		this.bodies = [];
	}
}

/** Splits a migration into the statements it holds, numbering each from the line it starts on. */
export const splitStatements = (sql: string, startingLine = firstLine): SqlStatement[] =>
	new StatementScanner(sql, startingLine).scan();
