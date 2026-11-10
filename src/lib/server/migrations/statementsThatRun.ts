import type { SqlBody, SqlStatement } from './sqlStatement';
import { splitStatements } from './sqlStatements';

const anonymousBlock = /^do\b/i;

const statementsInBody = (body: SqlBody): SqlStatement[] => statementsThatRun(body.sql, body.line);

/**
 * Every statement a migration runs when it is applied: its own statements, and the statements inside
 * each `do` block it runs. A function's body is left out, since defining a function runs none of it.
 */
export const statementsThatRun = (sql: string, startingLine?: number): SqlStatement[] =>
	splitStatements(sql, startingLine).flatMap((statement) => {
		const isAnonymousBlock = anonymousBlock.test(statement.code);
		if (!isAnonymousBlock) return [statement];
		return [statement, ...statement.bodies.flatMap(statementsInBody)];
	});
