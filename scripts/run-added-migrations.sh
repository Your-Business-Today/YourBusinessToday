#!/usr/bin/env bash
# Runs, against the live Supabase database, every migration file a push to main
# added under migrations/, in filename order. Called by the run-migrations
# workflow; a file that was already on main is never run again, because every
# migration before this workflow existed was run by hand.
#
# Usage:
#   SUPABASE_DB_URL='postgresql://...' ./scripts/run-added-migrations.sh <before-sha> <after-sha>

set -euo pipefail

readonly migrationsPattern='migrations/*.sql'
readonly commitThatDoesNotExist='0000000000000000000000000000000000000000'

beforeCommit="${1:-}"
afterCommit="${2:-}"

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

runMigration() {
	local migrationFile="$1"
	echo "Running $migrationFile"
	psql "$SUPABASE_DB_URL" \
		--single-transaction \
		--set ON_ERROR_STOP=on \
		--file "$migrationFile" \
		|| failWith "$migrationFile failed and was rolled back; the migrations after it were not run."
	echo "Applied $migrationFile"
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

while IFS= read -r migrationFile; do
	runMigration "$migrationFile"
done <<< "$addedMigrations"
