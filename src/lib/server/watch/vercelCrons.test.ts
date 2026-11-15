import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { billingSchedulesSourceName } from './billingSchedulesSource';
import { deployWindowsSourceName } from './deployWindowsSource';
import { fillTerritoriesSourceName } from './fillTerritoriesSource';
import { tradingPlacesSourceName } from './tradingPlacesSource';
import { validateWatchSourceName } from './watchSources';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));

type Cron = { path: string; schedule: string };

const crons = (JSON.parse(readFileSync('vercel.json', 'utf8')) as { crons: Cron[] }).crons;

const cronDoor = '/api/watch/';

const oneMinuteOrHour = /^\d+$/;

/** On Vercel's Hobby plan a cron runs once a day at most: its minute and its hour are each one number. */
function isDailyAtMost(schedule: string): boolean {
	const [minute, hour] = schedule.split(' ');
	return oneMinuteOrHour.test(minute) && oneMinuteOrHour.test(hour);
}

const hoursInADay = 24;
const minutePastTheHour = 1;

/** One daily cron for each hour of the day in UTC, a minute past it: together, a knock every hour. */
function hourlyKnocks(): string[] {
	return Array.from({ length: hoursInADay }, (_, hour) => `${minutePastTheHour} ${hour} * * *`);
}

describe("Vercel's crons", () => {
	it('each knock on the cron door for a source the door knows', () => {
		for (const cron of crons) {
			expect(cron.path.startsWith(cronDoor)).toBe(true);
			expect(validateWatchSourceName(cron.path.slice(cronDoor.length))).not.toBeNull();
		}
	});

	it('each run once a day at most, as the Hobby plan allows', () => {
		const tooOften = crons.filter((cron) => !isDailyAtMost(cron.schedule));
		expect(tooOften).toEqual([]);
	});

	it('knock the billing run at five past six, seven and eight UTC, so one lands between 07:00 and 08:00 UK time all year', () => {
		const billingKnocks = crons.filter((cron) => cron.path === `${cronDoor}${billingSchedulesSourceName}`).map((cron) => cron.schedule);
		expect(billingKnocks).toEqual(['5 6 * * *', '5 7 * * *', '5 8 * * *']);
	});

	it('knock the deploy windows in every hour of the day, so a window set on the hour opens within that hour, whatever hour a project sets', () => {
		const windowKnocks = crons.filter((cron) => cron.path === `${cronDoor}${deployWindowsSourceName}`).map((cron) => cron.schedule);
		expect(windowKnocks).toEqual(hourlyKnocks());
	});

	it('knock the filling of territories at twenty past two, three and four UTC, so three fill in a night before their postcodes are placed at five past six', () => {
		const fillKnocks = crons.filter((cron) => cron.path === `${cronDoor}${fillTerritoriesSourceName}`).map((cron) => cron.schedule);
		expect(fillKnocks).toEqual(['20 2 * * *', '20 3 * * *', '20 4 * * *']);
	});

	it('knock the loading of trading places at ten to three, four and five UTC, half an hour after each territory is filled, so three load in a night', () => {
		const placesKnocks = crons.filter((cron) => cron.path === `${cronDoor}${tradingPlacesSourceName}`).map((cron) => cron.schedule);
		expect(placesKnocks).toEqual(['50 2 * * *', '50 3 * * *', '50 4 * * *']);
	});
});
