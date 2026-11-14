import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearWatchRuns, watchRunRows } from '$lib/server/watch/watchRunsDatabase.fixture';
import { billingSchedulesSourceName } from '$lib/server/watch/billingSchedulesSource';
import { holdBooksWithoutSchedules, runOnTheBooks as run } from './booksBillingScheduleWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const noteNamingEveryOrganisation = 'Jewel Property Serve: Invoices raised 2, issued 2, sent 2.';

function billingRunStarted(startedAt: string): void {
	watchRunRows.push({ source: billingSchedulesSourceName, started_at: startedAt, note: noteNamingEveryOrganisation });
}

describe("list_billing_schedules on today's billing run", () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		holdBooksWithoutSchedules();
		clearWatchRuns();
	});
	afterEach(() => vi.useRealTimers());

	it('says when it started in winter: the first run from 07:00 UK time, not the knock before it', async () => {
		vi.setSystemTime(new Date('2026-11-14T09:30:00.000Z'));
		billingRunStarted('2026-11-13T07:04:00.000Z');
		billingRunStarted('2026-11-14T06:05:00.000Z');
		billingRunStarted('2026-11-14T07:06:00.000Z');
		billingRunStarted('2026-11-14T08:05:00.000Z');
		watchRunRows.push({ source: 'register', started_at: '2026-11-14T07:01:00.000Z', note: '' });
		const answer = await run('list_billing_schedules', {});
		expect(answer).toContain("Today's billing run started at 07:06 UK time.");
		expect(answer).not.toContain(noteNamingEveryOrganisation);
	});

	it('says when it started in summer, on the knock at five past six UTC', async () => {
		vi.setSystemTime(new Date('2027-07-01T09:00:00.000Z'));
		billingRunStarted('2027-07-01T06:20:00.000Z');
		expect(await run('list_billing_schedules', {})).toContain("Today's billing run started at 07:20 UK time.");
	});

	it('says it has not started yet and when it last started, when only an earlier day ran', async () => {
		vi.setSystemTime(new Date('2026-11-14T06:40:00.000Z'));
		billingRunStarted('2026-11-13T07:04:00.000Z');
		const answer = await run('list_billing_schedules', {});
		expect(answer).toContain("Today's billing run has not started: it opens at 07:00 UK time. It last started 13 Nov 2026, 07:04 UK time.");
		expect(answer).not.toContain(noteNamingEveryOrganisation);
	});

	it('says the run has never run, after saying the books hold no schedules', async () => {
		vi.setSystemTime(new Date('2026-11-14T09:30:00.000Z'));
		const answer = await run('list_billing_schedules', {});
		expect(answer).toContain('hold no billing schedules');
		expect(answer).toContain('The billing run has never run. It opens at 07:00 UK time each day.');
	});
});
