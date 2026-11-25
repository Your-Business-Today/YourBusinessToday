import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CostShareMembersBy, liveProjectStatuses } from '$lib/data/books/sharing/costShareMembersBy';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { projectStatusChangesTable } from './costShareStatusMembers';

const migration = readFileSync('migrations/0292_cost_shares_by_project_status.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');

describe('migration 0292, shared costs kept by rule and the history of each project’s status', () => {
	it('holds the same ways of finding members as the rules, and names the live statuses as the rule reads them', () => {
		const choices = Object.values(CostShareMembersBy).map((choice) => `'${choice}'`);
		expect(statements).toContain(`check (members_by in (${choices.join(', ')}))`);
		for (const status of liveProjectStatuses) expect(migration).toContain(status);
	});

	it('keeps every status change by trigger, each project’s status today as where its history starts', () => {
		expect(statements).toContain('after insert or update of status on public.projects');
		expect(statements).toContain('is_starting_status');
		expect(statements).toContain('security definer');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		expect(statements).toContain(`alter table public.${projectStatusChangesTable} enable row level security;`);
		expect(tablesKeptByOrganisation).toContain(projectStatusChangesTable);
		expect(statements).not.toMatch(/create policy/);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
	});
});
