import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CashflowItemLimits, cashflowDirectionNames, cashflowRepeatNames } from '$lib/data/books/cashflow/cashflowItem';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { cashflowItemsTable, toCashflowItemColumns } from './cashflowItems';

const migration = readFileSync('migrations/0283_books_cashflow_items.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

const anItem = { title: 'Hosting', direction: 'out', amount: 20, repeats: 'monthly', firstMonth: '2026-12', lastMonth: null, notes: '' } as const;

describe('migration 0283, the items of the cashflow forecast, and the limits the connector checks', () => {
	it('holds the same lengths and choices as the rules, with every column the site writes', () => {
		expect(statements).toContain(`check (char_length(title) between 1 and ${CashflowItemLimits.longestTitle} and btrim(title) = title)`);
		expect(statements).toContain(`check (char_length(notes) <= ${CashflowItemLimits.longestNotes})`);
		expect(statements).toContain(`check (direction in (${quotedList(cashflowDirectionNames)}))`);
		expect(statements).toContain(`check (repeats in (${quotedList(cashflowRepeatNames)}))`);
		for (const column of Object.keys(toCashflowItemColumns(anItem))) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
	});

	it('keeps each month as its first day, and a last month only on an item that repeats, never before its first', () => {
		expect(toCashflowItemColumns(anItem)).toMatchObject({ first_month: '2026-12-01', last_month: null });
		expect(statements).toContain('check (extract(day from first_month) = 1)');
		expect(statements).toContain("check (last_month is null or (repeats <> 'once' and last_month >= first_month))");
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		expect(statements).toContain(`alter table public.${cashflowItemsTable} enable row level security;`);
		expect(statements).not.toMatch(/create policy/);
		expect(tablesKeptByOrganisation).toContain(cashflowItemsTable);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
		expect(statements).toContain(`create table if not exists public.${cashflowItemsTable}`);
	});
});
