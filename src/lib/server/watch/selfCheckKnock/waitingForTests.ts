import type { DoorAnswer, DoorKnocker } from './deployedDoor';
import type { MigrationRun, MigrationRunReader } from './migrationRunWait';
import { startWaiting, type Clock, type Waiting } from './waiting';

/** A clock whose pauses move time on at once, so the knock's tests wait without waiting. */
export function waitingWithoutWaiting(): Waiting & { lines: string[] } {
	let time = 0;
	const clock: Clock = { now: () => time, pause: async (milliseconds) => void (time += milliseconds) };
	const lines: string[] = [];
	return { ...startWaiting(clock, (line) => lines.push(line)), lines };
}

/** A door that gives its answers in turn, then keeps giving the last. */
export function doorAnswering(...answers: DoorAnswer[]): DoorKnocker & { knocks: () => number } {
	let knocksMade = 0;
	const knock = async () => answers[Math.min(knocksMade++, answers.length - 1)];
	return Object.assign(knock, { knocks: () => knocksMade });
}

/** A run migrations run that reads as each of the given states in turn, then keeps reading as the last. */
export function migrationRunReading(...runs: (MigrationRun | null)[]): MigrationRunReader {
	let readsMade = 0;
	return async () => runs[Math.min(readsMade++, runs.length - 1)];
}
