import { knockUntilDeployed, type DoorKnocker } from './deployedDoor';
import type { KnockVerdict } from './knockVerdict';
import { waitForMigrations, type MigrationRunReader } from './migrationRunWait';
import type { Waiting } from './waiting';

export type SelfCheckKnock = { commit: string; knockDoor: DoorKnocker; readMigrationRun: MigrationRunReader; waiting: Waiting };

/**
 * Runs the connector self-check for one deploy: once the deploy's migrations have finished, and against the
 * deployment built from its commit, so neither the deployment before it nor a half-migrated database answers.
 */
export async function knockConnectorSelfCheck(knock: SelfCheckKnock): Promise<KnockVerdict> {
	knock.waiting.say(`Waiting for the deploy of ${knock.commit} to settle before its connector self-check counts.`);
	const migrationsVerdict = await waitForMigrations(knock.commit, knock.readMigrationRun, knock.waiting);
	if (migrationsVerdict !== null) return migrationsVerdict;
	return knockUntilDeployed(knock.commit, knock.knockDoor, knock.waiting);
}
