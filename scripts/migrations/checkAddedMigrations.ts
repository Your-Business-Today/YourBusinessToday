import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describeDataLoss, findDataLoss } from '$lib/server/migrations/migrationDataLoss';

/**
 * Refuses a change whose new or changed migrations would drop, rename or empty a table or a column, or delete rows.
 * The files the change adds or changes under migrations/ are read: the run migrations workflow runs every file
 * not on its record, and a file that failed is corrected in place, so a changed file can run too. Renames are
 * read as a file added under its new name, since the record goes by name and the deploy runs it again.
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

const gitDiff = ['diff', '--name-only', '--no-renames', '--diff-filter=AM', baseCommit, 'HEAD', '--', migrationsPattern];
const migrationsToRead = execFileSync('git', gitDiff, { encoding: 'utf8' }).split('\n').filter(Boolean).sort();
const findings = migrationsToRead.flatMap((file) => findDataLoss(file, readFileSync(file, 'utf8')));
const migrationsNamed = migrationsToRead.length === 0 ? 'none' : migrationsToRead.join(', ');

console.log(`Migrations this change adds or changes: ${migrationsNamed}`);
for (const finding of findings) {
	console.log(`::error file=${finding.file},line=${finding.line}::${describeDataLoss(finding)}`);
}
if (findings.length > 0) process.exit(failed);
console.log('No migration this change adds or changes takes away data already there.');
