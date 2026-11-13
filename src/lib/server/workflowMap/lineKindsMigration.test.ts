import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { lineKind, lineKinds } from '$lib/data/workflowMap/workflowMap';

const migration = readFileSync('migrations/0215_workflow_map_line_kinds_and_arrivals.sql', 'utf8');

describe('migration 0215, a line kind and what arrives from outside, and the limits the connector checks', () => {
	it('allows every line kind and only those, a role by default', () => {
		expect(migration).toContain(`kind in (${lineKinds.map((kind) => `'${kind}'`).join(', ')})`);
		expect(migration).toContain(`add column if not exists kind text not null default '${lineKind.role}'`);
		expect(migration).toContain(`coalesce(line ->> 'kind', '${lineKind.role}')`);
	});

	it('holds the same lengths and counts on an arrival', () => {
		expect(migration).toContain(`position between 1 and ${limits.mostArrivals}`);
		expect(migration).toContain(`char_length(what_arrives) between 1 and ${limits.whatArrivesLength}`);
		expect(migration).toContain(`char_length(arrives_from) between 1 and ${limits.arrivesFromLength}`);
	});

	it('keeps arrivals to the server, as hand-overs are, and refuses one naming no station', () => {
		expect(migration).toContain('alter table public.workflow_map_arrivals enable row level security;');
		expect(migration).not.toMatch(/create policy/);
		expect(migration).toContain("raise exception 'An arrival names a station that is not in this version.'");
		expect(migration).toContain('revoke execute on function public.file_workflow_map(uuid, uuid, jsonb) from public, anon, authenticated;');
	});

	it('only adds: it alters no table but the workflow map lines, and drops and copies nothing', () => {
		expect(migration).not.toMatch(/\balter table public\.(?!workflow_map_)/);
		expect(migration).not.toMatch(/\bdrop\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\./);
	});
});
