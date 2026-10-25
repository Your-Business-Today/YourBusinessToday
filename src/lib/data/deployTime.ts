/** The time of day a project's staging branch is promoted to its default branch, as HH:MM in UK time; null is no window. */
export type DeployTime = string | null;

const deployTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const minutesLength = 'HH:MM'.length;

export const noDeployWindow: DeployTime = null;

export const deployTimeRefusal = 'Deploy staging to main at is a time of day as HH:MM, UK time; leave it blank for no window.';

/** Whether a written time fits the deploy_staging_at column: blank for none, or hours and minutes. */
export function isDeployTime(written: string): boolean {
	return written === '' || deployTimePattern.test(written);
}

/** The time as the column holds it, or null for blank; a written time is checked with isDeployTime first. */
export function deployTimeOf(written: string): DeployTime {
	return written === '' ? noDeployWindow : written;
}

/** The time as the column returns it (HH:MM:SS) read back to HH:MM, or null for none. */
export function parseDeployTime(column: unknown): DeployTime {
	if (column === null || column === undefined || column === '') return noDeployWindow;
	return String(column).slice(0, minutesLength);
}
