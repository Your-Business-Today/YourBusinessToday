import type { DeployTime } from './deployTime';
import type { UkClock } from './ukClock';

export type DeployWindowReading = {
	deployTime: DeployTime;
	clock: UkClock;
	lastWindowDate: string | null;
	wasLastWindowFailed: boolean;
};

/**
 * The one rule: a project's window is due when it has a deploy time, that time has passed on the UK clock today,
 * and today's window has not run — or ran and failed, so it is tried again.
 */
export function isDeployWindowDue(reading: DeployWindowReading): boolean {
	const { deployTime, clock } = reading;
	if (deployTime === null) return false;
	if (clock.time < deployTime) return false;
	const hasRunToday = reading.lastWindowDate === clock.date;
	return !hasRunToday || reading.wasLastWindowFailed;
}
