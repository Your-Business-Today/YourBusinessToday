#!/usr/bin/env bash
# Builds a scratch database that stands in for the live one as it is at a
# commit: Supabase's own roles and the parts of auth and storage the migrations
# name (supabase-stand-ins.sql), then docs/sql/base-schema.sql and
# docs/sql/fix-everything.sql, then every migrations/*.sql file at that commit,
# in the order the runner sorts them.
#
# The history was never meant to be replayed from nothing: the files from before
# the run migrations workflow were run by hand, and a few of them name columns
# that were renamed later. So this replay forgives. Each statement runs on its
# own and one that fails is skipped, and the whole history is replayed twice, so
# a statement that names something made later finds it the second time. What
# comes out is close to the live shape, not a copy of it. The strict run is the
# rehearsal's, through the deploy's own runner.
#
# Usage:
#   SCRATCH_SERVER_URL='postgresql://postgres@127.0.0.1:54329' \
#     ./scripts/migrations/build-stand-in-database.sh <database name> <commit>

set -euo pipefail

readonly database="${1:?Give the name of the scratch database to build}"
readonly commit="${2:?Give the commit whose files the database stands for}"
readonly server="${SCRATCH_SERVER_URL:?Set SCRATCH_SERVER_URL to the scratch Postgres server}"
readonly standIns="$(dirname "$0")/supabase-stand-ins.sql"
readonly baseSchemaFiles=(docs/sql/base-schema.sql docs/sql/fix-everything.sql)

historyFiles="$(mktemp -d)"
trap 'rm -rf "$historyFiles"' EXIT

takeHistoryAtCommit() {
	git archive "$commit" "${baseSchemaFiles[@]}" migrations | tar -x -C "$historyFiles"
}

makeEmptyDatabase() {
	psql "$server/postgres" --no-psqlrc --quiet --set ON_ERROR_STOP=on \
		--command "drop database if exists $database" \
		--command "create database $database"
	psql "$server/$database" --no-psqlrc --quiet --set ON_ERROR_STOP=on --file "$standIns"
}

replayFile() {
	psql "$server/$database" --no-psqlrc --quiet \
		--set ON_ERROR_STOP=off --set ON_ERROR_ROLLBACK=on \
		--file "$1" 2>&1
}

listHistoryInOrder() {
	printf '%s\n' "${baseSchemaFiles[@]}"
	(cd "$historyFiles" && ls migrations/*.sql | LC_ALL=C sort)
}

replayHistory() {
	while IFS= read -r historyFile; do
		replayFile "$historyFiles/$historyFile"
	done < <(listHistoryInOrder)
}

countSkippedStatements() {
	grep --count 'ERROR:' || true
}

takeHistoryAtCommit
makeEmptyDatabase
echo "Building $database from $(listHistoryInOrder | wc -l) files at $commit, twice"
echo "First replay: $(replayHistory | countSkippedStatements) statements skipped"
echo "Second replay: $(replayHistory | countSkippedStatements) statements skipped"
