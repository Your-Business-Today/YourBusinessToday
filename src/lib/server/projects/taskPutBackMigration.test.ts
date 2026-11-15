import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsFolder = 'migrations';
const recordFunction = 'function public.keep_record_of_deleted_task()';
const putBackFunction = 'function public.put_back_deleted_task(';
const partOfTheCopy = /'(\w+)', \(\s*select coalesce\(jsonb_agg\(to_jsonb\((\w+)\)/g;
const linksCleared = ['linked_todo_ids', 'linked_feature_request_ids', 'waiting_task_ids'];
const notPutBack = ['task_attachments'];

function latestDefining(functionName: string): string {
	const files = readdirSync(migrationsFolder)
		.filter((file) => file.endsWith('.sql'))
		.sort();
	const statements = files.map((file) => readFileSync(join(migrationsFolder, file), 'utf8'));
	return statements.filter((text) => text.includes(`create or replace ${functionName}`)).at(-1) ?? '';
}

describe('putting a deleted task back', () => {
	const record = latestDefining(recordFunction);
	const putBack = latestDefining(putBackFunction);
	const parts = [...record.matchAll(partOfTheCopy)];

	it('puts back every part of the copy but its files, which are not kept', () => {
		expect(parts.length).toBeGreaterThan(10);
		for (const [, part] of parts.filter(([, part]) => !notPutBack.includes(part))) {
			expect(putBack, `${part} is on the record but not put back`).toContain(`'public.${part}'`);
		}
		expect(putBack).not.toContain("'public.task_attachments'");
	});

	it('points back every link the deletion cleared', () => {
		for (const link of linksCleared) expect(putBack).toContain(`kept.record -> '${link}'`);
	});

	it('copies each part as its row, never as a column that shares the row’s name', () => {
		const lifecycleColumns = ['step'];
		for (const [, part, row] of parts) expect(lifecycleColumns, `${part} is copied as ${row}`).not.toContain(row);
	});
});
