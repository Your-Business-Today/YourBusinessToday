#!/usr/bin/env bash
# Rehearses the next deploy's migration run on a scratch database, so the live
# deploy is never the first time a migration runs. It builds a stand-in for the
# live database as it is at the default branch's commit
# (build-stand-in-database.sh), then runs the deploy's own runner,
# scripts/run-added-migrations.sh, from that commit to the one checked out here:
# every file the deploy would run, in the deploy's order. The runner reads each
# file from the working tree, so run this from a checkout of the commit the next
# deploy would take: in CI, the pull request's merge commit. It runs them a second time on the
# same database, so "safe to run twice" is proved and not only promised.
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

readonly deployedCommit="${1:?Give the default branch's commit, the one the live database stands at}"
readonly nextCommit="$(git rev-parse HEAD)"

failWith() {
	echo "::error::$1"
	exit 1
}

listWaitingMigrations() {
	git diff --name-only --diff-filter=A "$deployedCommit" "$nextCommit" -- 'migrations/*.sql' | LC_ALL=C sort
}

readingsKept() {
	psql "$server/$rehearsalDatabase" --no-psqlrc --quiet --tuples-only --no-align \
		--set ON_ERROR_STOP=on --set commit="$nextCommit" --file "$here/readings-kept-for-commit.sql"
}

runTheDeploy() {
	local runNumber="$1"
	echo "::group::Run $runNumber of $runsInRehearsal, by the deploy's own runner"
	SUPABASE_DB_URL="$server/$rehearsalDatabase" "$runner" "$deployedCommit" "$nextCommit" \
		|| failWith "Run $runNumber of $runsInRehearsal went red, so the live deploy would too. The runner's lines above name the file or the table."
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

waitingMigrations=$(listWaitingMigrations)
if [ -z "$waitingMigrations" ]; then
	echo "The next deploy would run no migration, so there is nothing to rehearse."
	exit 0
fi

echo "The next deploy would run these $(wc -l <<< "$waitingMigrations") files, in this order:"
echo "$waitingMigrations"
"$here/build-stand-in-database.sh" "$rehearsalDatabase" "$deployedCommit"
for runNumber in $(seq "$runsInRehearsal"); do
	runTheDeploy "$runNumber"
	requireReadingsKept "$runNumber"
done
echo "Rehearsed: the next deploy's migrations ran clean twice on a scratch database standing for $deployedCommit."
