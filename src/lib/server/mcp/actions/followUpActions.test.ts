import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { followUpActions, untilNotADay } from './followUpActions';
import { followUpWith, riversLtdId, samId } from '$lib/server/people/followUp.fixture';
import type { FollowUp } from '$lib/server/people/getFollowUpsDue';
import type { McpCaller } from '../resolveMcpCaller';

const { register, followUpsRead } = vi.hoisted(() => ({ register: { due: [] as FollowUp[] }, followUpsRead: vi.fn() }));

vi.mock('$lib/server/people/getFollowUpsDue', () => ({
	getFollowUpsDue: async (supabase: unknown, until: string) => {
		followUpsRead(supabase, until);
		return register.due;
	}
}));

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const noonOnThe15th = new Date('2026-11-15T12:00:00Z');
const today = '2026-11-15';

function listDue(input: Record<string, unknown>) {
	const [action] = followUpActions;
	return action.run(staff, input);
}

describe('list_follow_ups_due', () => {
	beforeEach(() => {
		vi.useFakeTimers({ now: noonOnThe15th });
		register.due = [followUpWith()];
		followUpsRead.mockClear();
	});

	afterEach(() => vi.useRealTimers());

	it('reads up to today when no day is given, and says who, what, how overdue, where, how to reach them and when we last spoke', async () => {
		expect(await listDue({})).toBe(
			'One follow-up is due today:\n' +
				`Sam Rivers — Call about the portal demo — due 12 Nov 2026, 3 days overdue — Rivers Ltd (Lead, client ${riversLtdId}) — sam@example.com, 020 7946 0000 — last spoken to 1 Nov 2026 — person ${samId}`
		);
		expect(followUpsRead).toHaveBeenCalledWith(staff.supabase, today);
	});

	it('reads up to a later day when one is given, the longest overdue first as the register gives them', async () => {
		const nextWeek = followUpWith({ id: 'asha', name: 'Asha Patel', nextActionDue: '2026-11-20', email: '', phone: '', lastContactedOn: null, companies: [] });
		register.due = [followUpWith(), nextWeek];
		const answer = await listDue({ until: '2026-11-20' });
		expect(answer).toContain('2 follow-ups are due by 20 Nov 2026, the longest overdue first:');
		expect(answer).toContain('Asha Patel — Call about the portal demo — due 20 Nov 2026 — no company yet — no email or phone held — never spoken to — person asha');
		expect(followUpsRead).toHaveBeenCalledWith(staff.supabase, '2026-11-20');
	});

	it('says so when nobody is due, and how a next step gets its day', async () => {
		register.due = [];
		expect(await listDue({})).toBe("Nobody's next step is due today. update_person gives a person a next step and the day it is due.");
	});

	it('refuses a day that is not one, reading nothing', async () => {
		expect(await listDue({ until: 'next Friday' })).toBe(untilNotADay);
		expect(await listDue({ until: '2026-02-30' })).toBe(untilNotADay);
		expect(followUpsRead).not.toHaveBeenCalled();
	});
});
