#!/usr/bin/env bash
# Runs, against the live Supabase database, every migration file on main that
# is not yet on the record of applied migrations (public.applied_migrations,
# 0197), in file-name order, each in one transaction, recording each as it is
# applied. It stops at the first file that fails; that file is not recorded, so
# the next run applies it and then the files after it. A run that stops part
# way, or one GitHub cancels, is finished by the next, and nothing is skipped.
#
# The first run finds no record. It applies the record's own migration first,
# then records every file that was on main before this push as run before the
# record began, without running any of them, and runs only the files this push
# added. From then on the record decides. A recorded file whose contents have
# changed since it ran is named in a warning and never run again.
#
# Around the migrations it takes the data inventory: every table's row count
# before the first and after the last, kept in data_inventories. The run goes
# red, naming each table, when any table has fewer rows after than before.
#
# Usage:
#   SUPABASE_DB_URL='postgresql://...' ./scripts/run-added-migrations.sh <before-sha> <after-sha>

set -euo pipefail

readonly migrationQueries="$(dirname "$0")/migrations"

source "$migrationQueries/rehearsal-postgres.sh"
source "$migrationQueries/migration-record.sh"
source "$migrationQueries/row-counts-around-the-run.sh"
source "$migrationQueries/begin-the-record.sh"

beforeCommit="${1:-}"
afterCommit="${2:-}"
failedMigration=''
migrationsThisRun=''

failWith() {
	echo "::error::$1"
	exit 1
}

requireCommitsGiven() {
	if [ -z "$beforeCommit" ] || [ -z "$afterCommit" ]; then
		failWith "Usage: ./scripts/run-added-migrations.sh <before-sha> <after-sha>"
	fi
}

listAddedMigrations() {
	git diff --name-only --diff-filter=A "$beforeCommit" "$afterCommit" -- 'migrations/*.sql' | LC_ALL=C sort
}

requireConnection() {
	if [ -n "${SUPABASE_DB_URL:-}" ]; then
		return 0
	fi
	requireCommitBefore
	if [ -z "$(listAddedMigrations)" ]; then
		echo "This push added no migrations, and without SUPABASE_DB_URL the record cannot be read for any still waiting."
		exit 0
	fi
	failWith "The repository secret SUPABASE_DB_URL is not set, so these migrations were NOT run. Add the secret (Settings > Secrets and variables > Actions) and re-run this workflow."
}

warnOfChangedRecordedFiles() {
	local changedFiles
	changedFiles=$(listChangedSinceRecorded "$SUPABASE_DB_URL") || failWith "The record of applied migrations could not be read, so no migration was run."
	while IFS= read -r changedFile; do
		[ -n "$changedFile" ] || continue
		echo "::warning::$changedFile has changed since it was applied, so it is not run again. A migration that has run is never edited; its correction is a new file."
	done <<< "$changedFiles"
}

readWaitingMigrations() {
	waitingMigrations=$(listWaitingMigrations "$SUPABASE_DB_URL") || failWith "The record of applied migrations could not be read, so no migration was run."
	migrationsThisRun+="$waitingMigrations"$'\n'
}

sayWhyTheMigrationFailed() {
	local fileName="$1"
	if isMigrationRecorded "$SUPABASE_DB_URL" "$fileName"; then
		echo "::error::$fileName committed and was recorded, then a statement after its own commit failed. What it committed stays applied and it is not run again; read the statements after its commit by hand. The migrations after it were not run."
		return 0
	fi
	echo "::error::$fileName failed and was rolled back with its record, so it is not on the record; the migrations after it were not run. The next run applies it and them."
}

runMigration() {
	local fileName="$1"
	echo "Running $fileName"
	if applyAndRecordMigration "$SUPABASE_DB_URL" "$afterCommit" "$fileName"; then
		echo "Applied and recorded $fileName"
		return 0
	fi
	failedMigration="$fileName"
	sayWhyTheMigrationFailed "$fileName"
	return 1
}

runEachMigration() {
	while IFS= read -r fileName; do
		[ -n "$fileName" ] || continue
		runMigration "$fileName" || return 0
	done <<< "$waitingMigrations"
}

requireCommitsGiven
requireConnection
reportPostgresVersion
recordState=$(readRecordState "$SUPABASE_DB_URL") || failWith "Whether the record of applied migrations is there could not be read, so no migration was run."

if [ "$recordState" = 'begun' ]; then
	warnOfChangedRecordedFiles
	readWaitingMigrations
	if [ -z "$waitingMigrations" ]; then
		echo "Every migration on main is on the record, so none is waiting."
		exit 0
	fi
	echo "Migrations on main not yet on the record:"
	echo "$waitingMigrations"
fi
if [ "$recordState" != 'begun' ]; then
	requireCommitBefore
	readMigrationsOnMainBefore
fi

takeRowsBefore
if [ "$recordState" != 'begun' ]; then
	beginTheRecord || true
fi
if [ -z "$failedMigration" ]; then
	runEachMigration
fi
takeRowsAfter
keepInventory "$afterCommit" "$migrationsThisRun"
requireNoRowsLost

if [ -n "$failedMigration" ]; then
	failWith "$failedMigration failed, so the run stopped there."
fi
