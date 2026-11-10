/** The clock a knock waits by, how long it waits, and where it says what it is waiting for. */
export type Clock = { now: () => number; pause: (milliseconds: number) => Promise<void> };
export type Waiting = { clock: Clock; hasRunOutOfTime: () => boolean; say: (line: string) => void };

const millisecondsPerSecond = 1000;
const secondsPerMinute = 60;
const secondsBetweenLooks = 15;
export const minutesBeforeGivingUp = 10;
export const pauseBetweenLooks = secondsBetweenLooks * millisecondsPerSecond;
const patience = minutesBeforeGivingUp * secondsPerMinute * millisecondsPerSecond;

export const realClock: Clock = {
	now: () => Date.now(),
	pause: (milliseconds) => new Promise((resume) => setTimeout(resume, milliseconds))
};

/** Starts the time a knock may take from now. */
export function startWaiting(clock: Clock, say: (line: string) => void): Waiting {
	const givingUpAt = clock.now() + patience;
	return { clock, hasRunOutOfTime: () => clock.now() >= givingUpAt, say };
}
