const secondsInAMinute = 60;
const secondsInAnHour = 60 * secondsInAMinute;
const digitsInATimeUnit = 2;

/** How long a video runs, as a player shows it: 3:42, or 1:05:09 past the hour; nothing when it is not known. */
export function videoRunningTime(durationSeconds: number | null): string {
	if (durationSeconds === null) return '';
	const hours = Math.floor(durationSeconds / secondsInAnHour);
	const minutes = Math.floor((durationSeconds % secondsInAnHour) / secondsInAMinute);
	const seconds = String(durationSeconds % secondsInAMinute).padStart(digitsInATimeUnit, '0');
	if (hours === 0) return `${minutes}:${seconds}`;
	return `${hours}:${String(minutes).padStart(digitsInATimeUnit, '0')}:${seconds}`;
}
