import { describe, expect, it } from 'vitest';
import { describeDataLoss, findDataLoss } from './migrationDataLoss';

const file = 'migrations/0200_example.sql';
const lossesIn = (sql: string) => findDataLoss(file, sql).map((finding) => finding.loss);

describe('findDataLoss refuses a migration that takes away data', () => {
	it.each([
		['drop table if exists public.invoices;', 'drops a table'],
		['drop schema legacy cascade;', 'drops a schema, and every table in it'],
		['alter table public.tasks drop column notes;', 'drops a column'],
		['alter table public.tasks drop if exists notes;', 'drops a column'],
		['alter table public.tasks rename to jobs;', 'renames a table or a column'],
		['alter table public.tasks rename column notes to details;', 'renames a table or a column'],
		['truncate public.notifications;', 'empties a table'],
		['delete from public.notifications where is_read;', 'deletes rows'],
		['with old as (select id from a) delete from b using old where b.id = old.id;', 'deletes rows'],
		['drop type public.task_status cascade;', 'drops a type or a domain with cascade, and the columns that use it']
	])('%s', (sql, loss) => {
		expect(lossesIn(sql)).toEqual([loss]);
	});

	it('reads the statements a do block runs, and names the line each is on', () => {
		const sql = "do $$\nbegin\n  if to_regclass('public.a') is not null then\n    alter table public.a rename to b;\n  end if;\nend $$;";
		const findings = findDataLoss(file, sql);
		expect(findings.map((finding) => [finding.line, finding.loss])).toEqual([[2, 'renames a table or a column']]);
	});
});

describe('findDataLoss lets an additive migration through', () => {
	it.each([
		'create table if not exists public.books_accounts (id uuid primary key, name text not null);',
		'alter table public.tasks add column if not exists staged_at timestamptz;',
		'create index if not exists tasks_staged_at on public.tasks (staged_at);',
		'drop policy if exists "members read" on public.tasks; create policy "members read" on public.tasks for select using (true);',
		'drop function if exists public.f(uuid); create or replace function public.f(id uuid) returns void language sql as $$ select 1 $$;',
		'drop trigger if exists t on public.tasks; drop index if exists tasks_old; drop view if exists public.v;',
		'alter table public.tasks drop constraint if exists tasks_status_check, alter column notes drop not null, alter column notes drop default;',
		'alter table public.tasks rename constraint a_check to b_check; alter index tasks_a rename to tasks_b;',
		'alter table public.tasks add constraint tasks_project_fk foreign key (project_id) references public.projects on delete cascade;',
		'insert into public.books_accounts (id, name) select id, name from public.ledger_accounts on conflict do nothing;',
		"update public.tasks set details = '' where details is null;",
		"comment on table public.tasks is 'never drop table tasks; never delete from tasks';"
	])('%s', (sql) => {
		expect(lossesIn(sql)).toEqual([]);
	});

	it('leaves a function body alone, since defining a function deletes nothing', () => {
		const sql = 'create or replace function public.clear_read() returns void language plpgsql as $function$\nbegin\n  delete from public.notifications where is_read;\nend\n$function$;';
		expect(lossesIn(sql)).toEqual([]);
	});
});

describe('describeDataLoss', () => {
	it('names the file, the line and the statement, and says what to do instead', () => {
		const [finding] = findDataLoss(file, '-- clean up\n\ndelete from public.notifications;');
		const description = describeDataLoss(finding);
		expect(description).toContain('migrations/0200_example.sql line 3 deletes rows: delete from public.notifications —');
		expect(description).toContain('copy the rows into it');
	});
});
