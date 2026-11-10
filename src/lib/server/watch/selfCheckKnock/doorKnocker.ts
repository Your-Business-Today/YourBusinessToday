import { deployedCommitHeader } from '../deployedCommitHeader';
import type { DoorAnswer, DoorKnocker } from './deployedDoor';

const millisecondsPerSecond = 1000;
const longestKnockSeconds = 330;
const noAnswerStatus = 0;

/** Knocks on the watch door with the cron secret; a knock nobody answered is an answer from no deployment. */
export function doorKnocker(door: string, cronSecret: string): DoorKnocker {
	return async () => {
		try {
			return await knockOnce(door, cronSecret);
		} catch (failure) {
			const reason = failure instanceof Error ? failure.message : String(failure);
			return { status: noAnswerStatus, commit: null, body: reason };
		}
	};
}

async function knockOnce(door: string, cronSecret: string): Promise<DoorAnswer> {
	const signal = AbortSignal.timeout(longestKnockSeconds * millisecondsPerSecond);
	const response = await fetch(door, { headers: { authorization: `Bearer ${cronSecret}` }, signal });
	const answerHeaders = response.headers;
	return { status: response.status, commit: answerHeaders.get(deployedCommitHeader), body: await response.text() };
}
