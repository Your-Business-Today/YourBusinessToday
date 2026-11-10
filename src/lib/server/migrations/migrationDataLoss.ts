import { dataLossRules } from './dataLossRules';
import { statementsThatRun } from './statementsThatRun';
import type { SqlStatement } from './sqlStatement';

/** A statement in a migration file that would take away data already in the database. */
export type DataLossFinding = { file: string; line: number; loss: string; statement: string };

const longestStatementShown = 200;
const ellipsis = '…';

const whatToDoInstead =
	'Migrations only add, so no data already there is lost: build the new table or column beside the old one, ' +
	'copy the rows into it, and leave the old one as it is. Rows are copied, never moved or deleted.';

const shortened = (statement: string) =>
	statement.length <= longestStatementShown ? statement : statement.slice(0, longestStatementShown) + ellipsis;

const findingsIn = (file: string, statement: SqlStatement): DataLossFinding[] =>
	dataLossRules
		.filter((rule) => rule.pattern.test(statement.code))
		.map((rule) => ({ file, line: statement.line, loss: rule.loss, statement: shortened(statement.text) }));

/** Every statement in the migration that would drop, rename or empty a table or a column, or delete rows. */
export const findDataLoss = (file: string, sql: string): DataLossFinding[] =>
	statementsThatRun(sql).flatMap((statement) => findingsIn(file, statement));

/** What the finding says in CI: the file, the line, what the statement would take away and what to do instead. */
export const describeDataLoss = (finding: DataLossFinding): string =>
	`${finding.file} line ${finding.line} ${finding.loss}: ${finding.statement} — ${whatToDoInstead}`;
