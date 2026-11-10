import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describeDataLoss, findDataLoss } from '$lib/server/migrations/migrationDataLoss';

/**
 * Refuses a change whose new migrations would drop, rename or empty a table or a column, or delete rows.
 * Only the files the change adds under migrations/ are read, as the run migrations workflow runs only those,
 * so a migration already merged is never checked again.
 *
 *   node scripts/migrations/check-added-migrations.mjs <base commit>
 */
const migrationsPattern = 'migrations/*.sql';
const failed = 1;
const [baseCommit] = process.argv.slice(2);

if (baseCommit === undefined) {
	console.error('Usage: node scripts/migrations/check-added-migrations.mjs <base commit>');
	process.exit(failed);
}

const gitDiff = ['diff', '--name-only', '--diff-filter=A', baseCommit, 'HEAD', '--', migrationsPattern];
const addedMigrations = execFileSync('git', gitDiff, { encoding: 'utf8' }).split('\n').filter(Boolean).sort();
const findings = addedMigrations.flatMap((file) => findDataLoss(file, readFileSync(file, 'utf8')));

console.log(`Migrations this change adds: ${addedMigrations.length === 0 ? 'none' : addedMigrations.join(', ')}`);
for (const finding of findings) {
	console.log(`::error file=${finding.file},line=${finding.line}::${describeDataLoss(finding)}`);
}
if (findings.length > 0) process.exit(failed);
console.log('No migration this change adds takes away data already there.');
