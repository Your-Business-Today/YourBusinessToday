import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardMinutesLimits } from '$lib/data/boardroomMinutesRules';
import { allMinutesAnswers } from '$lib/data/boardroomMinutes';

const migration = readFileSync('migrations/0192_boardroom_minutes.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const ownTables = ['boardroom_meeting_closings', 'boardroom_minutes', 'boardroom_minutes_answers'];
const quoted = (values: string[]) => values.map((value) => `'${value}'`).join(', ');

describe('the minutes migration keeps every closing, version and answer as it was made', () => {
	it('creates only tables of its own, named boardroom', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(ownTables);
	});

	it('refuses every update and delete of a closing, a version and an answer, whoever asks', () => {
		for (const table of ownTables) expect(statements).toContain(`before insert or update or delete on public.${table}`);
		expect(statements).not.toMatch(/for (update|delete|all)/);
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('closes a meeting once, and only through a closing kept beside it', () => {
		expect(statements).toContain('if old.closed_at is not null and new.closed_at is distinct from old.closed_at then');
		expect(statements).toContain('select 1 from public.boardroom_meeting_closings where meeting_id = new.id');
		expect(statements).toContain('after insert on public.boardroom_meeting_closings');
	});

	it('leaves every rule made before as it was made', () => {
		for (const earlier of ['boardroom_meetings_open_once', 'boardroom_decision_answers_are_kept', 'boardroom_agenda_keeps_to_its_meeting'])
			expect(statements).not.toContain(earlier);
	});

	it('holds the same limits and answers as the service', () => {
		expect(statements).toContain(`answer in (${quoted(allMinutesAnswers)})`);
		expect(statements).toContain(`char_length(words) between 1 and ${boardMinutesLimits.longestWords}`);
		expect(statements).toContain(`char_length(change_words) between 1 and ${boardMinutesLimits.longestChangeWords}`);
		expect(statements).toContain(`version between 1 and ${boardMinutesLimits.mostVersions}`);
	});
});
