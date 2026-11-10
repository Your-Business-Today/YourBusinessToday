import { doorKnocker } from '$lib/server/watch/selfCheckKnock/doorKnocker';
import { migrationRunReader, readBranchHead } from '$lib/server/watch/selfCheckKnock/githubRuns';
import { knockConnectorSelfCheck } from '$lib/server/watch/selfCheckKnock/knockConnectorSelfCheck';
import { realClock, startWaiting } from '$lib/server/watch/selfCheckKnock/waiting';

/**
 * Knocks the connector self-check for one production deploy, once that deploy is the one answering and its
 * migrations have finished. COMMIT is the deployed commit; left empty, as on a run started by hand, it is the
 * head of DEFAULT_BRANCH, which is what production serves.
 *
 *   node scripts/self-check/knock-connector-self-check.mjs
 */
const failed = 1;

const settings = process.env;

function requiredSetting(name: string): string {
	const value = settings[name];
	if (!value) throw new Error(`The setting ${name} is missing.`);
	return value;
}

const access = { repository: requiredSetting('GITHUB_REPOSITORY'), token: requiredSetting('GITHUB_TOKEN') };
const commit = settings.COMMIT || (await readBranchHead(access, requiredSetting('DEFAULT_BRANCH')));
const verdict = await knockConnectorSelfCheck({
	commit,
	knockDoor: doorKnocker(requiredSetting('DOOR'), requiredSetting('CRON_SECRET')),
	readMigrationRun: migrationRunReader(access),
	waiting: startWaiting(realClock, (line) => console.log(line))
});

if (!verdict.hasPassed) {
	console.log(`::error::${verdict.report}`);
	process.exit(failed);
}
console.log(verdict.report);
