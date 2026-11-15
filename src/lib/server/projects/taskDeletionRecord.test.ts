import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsFolder = 'migrations';
const baseSchemaFiles = ['docs/sql/base-schema.sql', 'docs/sql/fix-everything.sql'];
const recordFunction = 'function public.keep_record_of_deleted_task()';
const linkToTask = /references\s+(?:public\.)?tasks\b/gi;
const tableOpened = /(?:create table(?: if not exists)?|alter table(?: only)?)\s+(?:public\.)?(\w+)/gi;
const notHistory = ['notifications', 'task_upload_grants'];
const addItToTheCopy = 'hangs off a task: copy it in keep_record_of_deleted_task in a new migration, or name it here as not history';

function statementsOf(file: string): string {
	return readFileSync(file, 'utf8').replace(/--.*$/gm, '');
}

function schemaInOrder(): string[] {
	const migrationFiles = readdirSync(migrationsFolder)
		.filter((file) => file.endsWith('.sql'))
		.sort()
		.map((file) => join(migrationsFolder, file));
	return [...baseSchemaFiles, ...migrationFiles].map(statementsOf);
}

function tableOpenedBefore(statements: string, position: number): string {
	const opened = [...statements.slice(0, position).matchAll(tableOpened)];
	const [, tableName] = opened.at(-1) ?? [];
	return tableName ?? 'a table this test could not name';
}

function tablesLinkedToTask(statements: string): string[] {
	return [...statements.matchAll(linkToTask)].map((link) => tableOpenedBefore(statements, link.index));
}

describe('the record of a deleted task', () => {
	const schema = schemaInOrder();
	const latestRecord = schema.filter((statements) => statements.includes(recordFunction)).at(-1) ?? '';
	const tablesLinked = [...new Set(schema.flatMap(tablesLinkedToTask))];

	it('is written by a function some migration defines', () => {
		expect(latestRecord).toContain(`create or replace ${recordFunction}`);
	});

	it('copies every table the schema hangs off a task, so a deleted task goes with its whole history', () => {
		expect(tablesLinked.length).toBeGreaterThan(15);
		for (const table of tablesLinked) {
			const isCopied = latestRecord.includes(`from public.${table} as `);
			const isLeftOut = notHistory.includes(table);
			expect(isCopied || isLeftOut, `${table} ${addItToTheCopy}`).toBe(true);
		}
	});

	it('copies the items of a checklist with their checklist, since they go when it does', () => {
		expect(latestRecord).toContain('from public.task_checklist_items as item where item.checklist_id = checklist.id');
	});
});
