#!/usr/bin/env bash
# Runs, against the live Supabase database, every migration file a push to main
# added under migrations/, in filename order. Called by the run-migrations
# workflow; a file that was already on main is never run again, because every
# migration before this workflow existed was run by hand.
#
# Around the migrations it takes the data inventory: every table's row count
# before the first and after the last, kept in data_inventories. The run goes
# red, naming each table, when any table has fewer rows after than before.
#
# Usage:
#   SUPABASE_DB_URL='postgresql://...' ./scripts/run-added-migrations.sh <before-sha> <after-sha>

set -euo pipefail

readonly migrationsPattern='migrations/*.sql'
readonly commitThatDoesNotExist='0000000000000000000000000000000000000000'
readonly inventoryQueries="$(dirname "$0")/migrations"

beforeCommit="${1:-}"
afterCommit="${2:-}"
failedMigration=''

failWith() {
	echo "::error::$1"
	exit 1
}

requireCommits() {
	if [ -z "$beforeCommit" ] || [ -z "$afterCommit" ]; then
		failWith "Usage: ./scripts/run-added-migrations.sh <before-sha> <after-sha>"
	fi
	if [ "$beforeCommit" = "$commitThatDoesNotExist" ]; then
		failWith "This push has no previous commit to compare with, so the migrations it added cannot be told apart. Run them by hand with psql."
	fi
}

listAddedMigrations() {
	git diff --name-only --diff-filter=A "$beforeCommit" "$afterCommit" -- "$migrationsPattern" | LC_ALL=C sort
}

requireConnection() {
	if [ -z "${SUPABASE_DB_URL:-}" ]; then
		failWith "The repository secret SUPABASE_DB_URL is not set, so these migrations were NOT run. Add the secret (Settings > Secrets and variables > Actions) and re-run this workflow."
	fi
}

runQuery() {
	psql "$SUPABASE_DB_URL" --no-psqlrc --quiet --tuples-only --no-align --set ON_ERROR_STOP=on "$@"
}

countEveryTable() {
	runQuery --file "$inventoryQueries/count-every-table.sql"
}

currentTime() {
	date -u +%Y-%m-%dT%H:%M:%S.%NZ
}

runMigration() {
	local migrationFile="$1"
	echo "Running $migrationFile"
	if ! psql "$SUPABASE_DB_URL" --single-transaction --set ON_ERROR_STOP=on --file "$migrationFile"; then
		echo "::error::$migrationFile failed and was rolled back; the migrations after it were not run."
		failedMigration="$migrationFile"
		return 1
	fi
	echo "Applied $migrationFile"
}

runEachMigration() {
	while IFS= read -r migrationFile; do
		runMigration "$migrationFile" || return 0
	done <<< "$addedMigrations"
}

asTextArray() {
	echo "{$(xargs -n1 basename <<< "$addedMigrations" | paste -sd, -)}"
}

keepInventory() {
	runQuery --file "$inventoryQueries/keep-data-inventory.sql" \
		--set commit="$afterCommit" --set files="$(asTextArray)" \
		--set before="$rowsBefore" --set beforeTakenAt="$beforeTakenAt" \
		--set after="$rowsAfter" --set afterTakenAt="$afterTakenAt" \
		|| echo "::warning::The row counts were checked but could not be kept in data_inventories."
}

listTablesWithFewerRows() {
	runQuery --file "$inventoryQueries/tables-with-fewer-rows.sql" --set before="$rowsBefore" --set after="$rowsAfter"
}

requireNoRowsLost() {
	local tablesWithFewerRows
	tablesWithFewerRows=$(listTablesWithFewerRows) || failWith "The row counts before and after could not be compared."
	if [ -z "$tablesWithFewerRows" ]; then
		echo "No table has fewer rows than before the migrations."
		return 0
	fi
	while IFS= read -r tableWithFewerRows; do
		echo "::error::$tableWithFewerRows"
	done <<< "$tablesWithFewerRows"
	failWith "Rows went missing while the migrations ran. Find what removed them before anything else merges; the daily backup holds them."
}

requireCommits
addedMigrations=$(listAddedMigrations)

if [ -z "$addedMigrations" ]; then
	echo "This push added no migrations."
	exit 0
fi

echo "Migrations this push added:"
echo "$addedMigrations"
requireConnection

beforeTakenAt=$(currentTime)
rowsBefore=$(countEveryTable) || failWith "The row counts could not be taken, so no migration was run."
runEachMigration
afterTakenAt=$(currentTime)
rowsAfter=$(countEveryTable) || failWith "The row counts after the migrations could not be taken, so nobody can tell whether rows were lost."
keepInventory
requireNoRowsLost

if [ -n "$failedMigration" ]; then
	failWith "$failedMigration failed, so the run stopped there."
fi
