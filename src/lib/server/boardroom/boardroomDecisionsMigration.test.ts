import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardDecisionLimits } from '$lib/data/boardroomDecisionRules';
import { allDecisionAgreements, allDecisionAnswers } from '$lib/data/boardroomDecision';

const migration = readFileSync('migrations/0189_boardroom_decisions.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const ownTables = ['boardroom_decision_rules', 'boardroom_decisions', 'boardroom_decision_answers'];
const quoted = (values: string[]) => values.map((value) => `'${value}'`).join(', ');

describe('the decisions migration keeps each decision and every director’s own answer as given', () => {
	it('creates only tables of its own, named boardroom, and adds a column beside the room’s others', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(ownTables);
		expect(statements).toContain('alter table public.boardroom_contributions\n\tadd column if not exists replaces_decision_id');
		expect(statements).toContain('alter table public.boardroom_held_contributions\n\tadd column if not exists replaces_decision_id');
	});

	it('refuses every update and delete of a rule, a decision and an answer, whoever asks', () => {
		for (const table of ownTables) expect(statements).toContain(`before insert or update or delete on public.${table}`);
		expect(statements).not.toMatch(/for (update|delete|all)/);
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('opens a decision only from its item’s agreed outcome, and answers only while the meeting is open', () => {
		expect(statements).toContain("and outcome = 'agreed'");
		expect(statements).toContain("if public.boardroom_meeting_stage(new.meeting_id) <> 'open' then");
		expect(statements).toContain('primary key (decision_id, director_id)');
	});

	it('leaves the room’s rules and the pause as 0185 and 0187 made them', () => {
		expect(statements).not.toContain('boardroom_contributions_are_kept');
		expect(statements).not.toContain('boardroom_seat_is_paused');
	});

	it('holds the same limits and answers as the service', () => {
		expect(statements).toContain(`answer in (${quoted(allDecisionAnswers)})`);
		expect(statements).toContain(`agreement in (${quoted(allDecisionAgreements)})`);
		expect(statements).toContain(`char_length(reason) between 1 and ${boardDecisionLimits.longestReason}`);
		expect(statements).toContain(`char_length(articles_reference) between 1 and ${boardDecisionLimits.longestArticlesReference}`);
		expect(statements).toContain(`quorum between ${boardDecisionLimits.smallestQuorum} and ${boardDecisionLimits.largestQuorum}`);
	});
});
