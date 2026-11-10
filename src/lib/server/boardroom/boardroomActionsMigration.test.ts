import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { actionDepartments, boardActionLimits } from '$lib/data/boardroomActionRules';

const migration = readFileSync('migrations/0194_boardroom_actions.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const ownTables = ['boardroom_actions', 'boardroom_action_raisings'];
const quoted = (values: string[]) => values.map((value) => `'${value}'`).join(', ');

describe('the actions migration only adds rows of its own, and leaves the live boards as they are', () => {
	it('creates only tables of its own, named boardroom', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(ownTables);
	});

	it('adds nothing to tasks, to-dos, assignees, projects or any table made before Boardroom', () => {
		const altered = [...statements.matchAll(/(?:alter table|on|references) public\.(\w+)/g)].map((match) => match[1]);
		expect(altered.filter((table) => !table.startsWith('boardroom_'))).toEqual([]);
	});

	it('refuses every update and delete of an action and its raising, whoever asks', () => {
		for (const table of ownTables) expect(statements).toContain(`before insert or update or delete on public.${table}`);
		expect(statements).not.toMatch(/for (update|delete|all)/);
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('holds an action to one raising, under a key written before anything is made', () => {
		expect(statements).toContain('action_id uuid primary key');
		expect(statements).toContain('made_id uuid not null unique');
	});

	it('holds the same limits and departments as the service', () => {
		expect(statements).toContain(`char_length(what) between 1 and ${boardActionLimits.longestWhat}`);
		expect(statements).toContain(`char_length(owner_name) between 1 and ${boardActionLimits.longestOwnerName}`);
		expect(statements).toContain(`char_length(project_name) between 1 and ${boardActionLimits.longestProjectName}`);
		expect(statements).toContain(`department in (${quoted(actionDepartments)})`);
	});
});
