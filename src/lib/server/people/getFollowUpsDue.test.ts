import { describe, expect, it } from 'vitest';
import { followUpsKeptBy, getFollowUpsDue, getFollowUpsKeptBy } from './getFollowUpsDue';
import { followUpWith, jewelId, riversLtdId, samId, yourBusinessTodayId } from './followUp.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const today = '2026-11-15';
const riversLtd = { id: riversLtdId, name: 'Rivers Ltd', lifecycle_stage: 'lead', kept_by_organisation_id: yourBusinessTodayId };
const jewelsLead = { id: 'client-of-jewel', name: 'Stone Homes', lifecycle_stage: 'prospect', kept_by_organisation_id: jewelId };

function person(facts: Row): Row {
	return { id: samId, name: 'Sam Rivers', created_at: '2026-11-01T09:00:00Z', next_action: 'Call about the portal demo', next_action_due: '2026-11-12', client_contacts: [], ...facts };
}

const people = [
	person({ id: 'due-today', name: 'Asha Patel', next_action_due: today }),
	person({ client_contacts: [{ clients: riversLtd }, { clients: null }] }),
	person({ id: 'due-tomorrow', name: 'Tom Hale', next_action_due: '2026-11-16' }),
	person({ id: 'no-day', name: 'Nia Cole', next_action_due: null }),
	person({ id: 'no-step', name: 'Omar Reid', next_action: '', next_action_due: '2026-11-10' })
];

function queryOver(rows: Row[]) {
	let selected = [...rows];
	const query = {
		select: () => query,
		lte: (column: string, day: string) => ((selected = selected.filter((row) => row[column] !== null && String(row[column]) <= day)), query),
		order: (column: string) => ((selected = [...selected].sort((first, second) => String(first[column]).localeCompare(String(second[column])))), query),
		then: (resolve: (answer: { data: Row[]; error: null }) => unknown) => resolve({ data: selected, error: null })
	};
	return query;
}

const supabase = { from: () => queryOver(people) } as unknown as SupabaseClient;

describe('the follow-ups due', () => {
	it('are the people whose next step falls on or before the day, and never one with no step or no day', async () => {
		const due = await getFollowUpsDue(supabase, today);
		expect(due.map((followUp) => followUp.name).sort()).toEqual(['Asha Patel', 'Sam Rivers']);
		expect((await getFollowUpsDue(supabase, '2026-11-16')).map((followUp) => followUp.id)).toContain('due-tomorrow');
	});

	it('carry the companies the person sits on, leaving out a listing whose company is gone', async () => {
		const due = await getFollowUpsDue(supabase, today);
		const sam = due.find((followUp) => followUp.id === samId);
		expect(sam?.companies).toEqual([{ id: riversLtdId, name: 'Rivers Ltd', stage: 'lead', keptByOrganisationId: yourBusinessTodayId }]);
		expect(sam?.nextActionDue).toBe('2026-11-12');
	});

	it("show on an organisation's register only for people at a company it keeps, with those companies alone", () => {
		const atBoth = followUpWith({ companies: [...followUpWith().companies, { id: 'client-of-jewel', name: jewelsLead.name, stage: 'prospect', keptByOrganisationId: jewelId }] });
		const kept = followUpsKeptBy([atBoth, followUpWith({ id: 'nowhere', companies: [] })], jewelId);
		expect(kept.map((followUp) => followUp.companies.map((company) => company.name))).toEqual([['Stone Homes']]);
	});

	it('are none where no organisation is picked, since there is no register to show them on', async () => {
		expect(await getFollowUpsKeptBy(supabase, null, today)).toEqual([]);
		expect((await getFollowUpsKeptBy(supabase, yourBusinessTodayId, today)).map((followUp) => followUp.id)).toEqual([samId]);
	});
});
