import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0248_premises_tied_to_their_lead.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the migration that lets a staff member tie a premises to its lead', () => {
	it('drops nothing and touches no table or policy', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger|policy)/i);
		expect(statements).not.toMatch(/alter table|create table|create policy|delete from|truncate|grant |revoke /i);
	});

	it('adds the one door, run with the rights of its owner', () => {
		expect(statements).toContain('create or replace function public.tie_premises_to_client(premises_id uuid, lead_client_id uuid)');
		expect(statements).toMatch(/security definer\s+set search_path to 'public'/);
	});

	it('lets in a project manager or the service role, and checks before it writes', () => {
		const guard = statements.indexOf("if not (public.is_project_manager() or auth.role() = 'service_role') then");
		const write = statements.indexOf('update public.premises');
		expect(guard).toBeGreaterThan(0);
		expect(write).toBeGreaterThan(guard);
	});

	it('changes the one column, and only for a premises tied to nobody', () => {
		expect(statements).toMatch(/update public\.premises\s+set client_id = lead_client_id\s+where id = premises_id and client_id is null;/);
	});

	it('refuses by name a premises it did not tie', () => {
		expect(statements).toMatch(/if not found then\s+raise exception 'That premises is not held, or is a lead already, so nothing was tied\.'/);
	});

	it('tells PostgREST of the new function', () => {
		expect(migration.trimEnd().endsWith("notify pgrst, 'reload schema';")).toBe(true);
	});
});
