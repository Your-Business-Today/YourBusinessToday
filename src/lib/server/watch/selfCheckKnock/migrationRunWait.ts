import { failedVerdict, type KnockVerdict } from './knockVerdict';
import { minutesBeforeGivingUp, pauseBetweenLooks, type Waiting } from './waiting';

export type MigrationRun = { status: string; conclusion: string | null; url: string };
export type MigrationRunReader = (commit: string) => Promise<MigrationRun | null>;

const finishedStatus = 'completed';
const succeededConclusion = 'success';

/** Waits for the commit's run migrations run to finish; answers why the check cannot count, or null to go on. */
export async function waitForMigrations(
	commit: string,
	readMigrationRun: MigrationRunReader,
	waiting: Waiting
): Promise<KnockVerdict | null> {
	let run = await readMigrationRun(commit);
	while (run !== null && run.status !== finishedStatus) {
		const hasGivenUp = waiting.hasRunOutOfTime();
		if (hasGivenUp) return unfinishedVerdict(commit, run);
		waiting.say(`The run migrations run for ${commit} is ${run.status}: looking again shortly. ${run.url}`);
		await waiting.clock.pause(pauseBetweenLooks);
		run = await readMigrationRun(commit);
	}
	return finishedRunVerdict(commit, run, waiting);
}

function finishedRunVerdict(commit: string, run: MigrationRun | null, waiting: Waiting): KnockVerdict | null {
	if (run === null) {
		waiting.say(`No run migrations run for ${commit}, so there are no migrations to wait for.`);
		return null;
	}
	if (run.conclusion === succeededConclusion) {
		waiting.say(`The run migrations run for ${commit} has finished: ${run.url}`);
		return null;
	}
	return failedVerdict(failedRunReport(commit, run));
}

function unfinishedVerdict(commit: string, run: MigrationRun): KnockVerdict {
	return failedVerdict(`Gave up after ${minutesBeforeGivingUp} minutes: the run migrations run for ${commit} had not finished, so the self-check was not run. ${run.url}`);
}

function failedRunReport(commit: string, run: MigrationRun): string {
	return `The run migrations run for ${commit} ended ${run.conclusion}, so the self-check was not run against a half-migrated database: ${run.url}`;
}
