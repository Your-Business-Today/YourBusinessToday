#!/usr/bin/env bash
# Rehearses the next deploy's migration run on a scratch database, so the live
# deploy is never the first time a migration runs. It builds a stand-in for the
# live database as it is at the default branch's commit
# (build-stand-in-database.sh), then runs the deploy's own runner,
# scripts/run-added-migrations.sh, from that commit to the one checked out here:
# every file the deploy would run, in the deploy's order. Once the record of
# applied migrations is on the default branch, the stand-in's record holds every
# file there except the ones this commit changes, as the live record would after
# a file failed and was corrected in place. The runner reads each
# file from the working tree, so run this from a checkout of the commit the next
# deploy would take: in CI, the pull request's merge commit. It runs them a second time on the
# same database, so "safe to run twice" is proved and not only promised: before
# the second run it takes off the stand-in's record the files the first applied.
#
# It goes red when a file fails, when a table has fewer rows after a run than
# before, or when a run kept no row counts in data_inventories, so a change that
# takes the counting out of the runner goes red too.
#
# It never connects to the live database and reads no secret: SCRATCH_SERVER_URL
# is a throwaway server (start-scratch-postgres.sh) holding nothing from
# production. It proves the SQL, the order and the runner's flow, not what live
# rows do.
#
# Usage:
#   SCRATCH_SERVER_URL='postgresql://postgres@127.0.0.1:54329' \
#     ./scripts/migrations/rehearse-added-migrations.sh <default branch's commit>

set -euo pipefail

readonly here="$(dirname "$0")"
readonly runner="$here/../run-added-migrations.sh"
readonly server="${SCRATCH_SERVER_URL:?Set SCRATCH_SERVER_URL to the scratch Postgres server}"
readonly rehearsalDatabase='ybt_rehearsal'
readonly readingsPerRun=2
readonly runsInRehearsal=2

readonly deployedCommit="${1:?Give the commit of the default branch, where the live database stands}"
readonly nextCommit="$(git rev-parse HEAD)"

source "$here/migration-record.sh"

failWith() {
	echo "::error::$1"
	exit 1
}

listFilesTheDeployWouldRun() {
	git diff --name-only --diff-filter=AM "$deployedCommit" "$nextCommit" -- 'migrations/*.sql' | LC_ALL=C sort
}

listFilesThisCommitChanges() {
	git diff --name-only --diff-filter=M "$deployedCommit" "$nextCommit" -- 'migrations/*.sql' | xargs -r -n1 basename | LC_ALL=C sort
}

recordTheDeployedHistory() {
	local standIn="$server/$rehearsalDatabase"
	if ! isRecordTableThere "$standIn"; then
		echo "The default branch has no record of applied migrations yet, so the first run rehearses beginning it."
		return 0
	fi
	local historyRecorded
	historyRecorded=$(LC_ALL=C comm -23 <(listMigrationsAtCommit "$deployedCommit") <(listFilesThisCommitChanges))
	recordMigrationsAtCommitAsRunBefore "$standIn" "$deployedCommit" "$historyRecorded"
	echo "The stand-in's record holds the $(wc -l <<< "$historyRecorded") files on the default branch that this commit does not change."
}

forgetWhatTheFirstRunApplied() {
	psql "$server/$rehearsalDatabase" --no-psqlrc --quiet --set ON_ERROR_STOP=on \
		--set commit="$nextCommit" --file "$here/forget-migrations-run-for-commit.sql"
}

readingsKept() {
	psql "$server/$rehearsalDatabase" --no-psqlrc --quiet --tuples-only --no-align \
		--set ON_ERROR_STOP=on --set commit="$nextCommit" --file "$here/readings-kept-for-commit.sql"
}

whyTheRunWentRed() {
	local runNumber="$1"
	if [ "$runNumber" -eq 1 ]; then
		echo "The first run went red, so the live deploy would too. The runner's lines above name the file or the table."
		return 0
	fi
	echo "Run $runNumber went red after the first ran clean, so a file is not safe to run twice. The runner's lines above name it."
}

runTheDeploy() {
	local runNumber="$1"
	echo "::group::Run $runNumber of $runsInRehearsal, by the deploy's own runner"
	SUPABASE_DB_URL="$server/$rehearsalDatabase" "$runner" "$deployedCommit" "$nextCommit" \
		|| failWith "$(whyTheRunWentRed "$runNumber")"
	echo "::endgroup::"
}

requireReadingsKept() {
	local runNumber="$1"
	local readingsExpected=$((readingsPerRun * runNumber))
	local readingsFound
	readingsFound=$(readingsKept)
	if [ "$readingsFound" -lt "$readingsExpected" ]; then
		failWith "Run $runNumber kept no row counts in data_inventories ($readingsFound readings for $nextCommit, $readingsExpected expected), so a live run would not show whether rows were lost."
	fi
	echo "Run $runNumber passed: every file applied, no table lost a row, and its row counts were kept."
}

waitingMigrations=$(listFilesTheDeployWouldRun)
if [ -z "$waitingMigrations" ]; then
	echo "The next deploy would run no migration, so there is nothing to rehearse."
	exit 0
fi

echo "Files the next deploy would run, in its order ($(wc -l <<< "$waitingMigrations")):"
echo "$waitingMigrations"
"$here/build-stand-in-database.sh" "$rehearsalDatabase" "$deployedCommit"
recordTheDeployedHistory
for runNumber in $(seq "$runsInRehearsal"); do
	if [ "$runNumber" -gt 1 ]; then
		forgetWhatTheFirstRunApplied
	fi
	runTheDeploy "$runNumber"
	requireReadingsKept "$runNumber"
done
echo "Rehearsed: the next deploy's migrations ran clean twice on a scratch database standing for $deployedCommit."
