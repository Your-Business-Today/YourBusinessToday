#!/usr/bin/env bash
# Proves on a scratch database that a first run which never began the record
# is finished by the next push's run. The push that brings the record's
# migration (0197) and two files, merged as a pull request is merged into main,
# never begins the record: once because its run never ran (cancelled, or the
# database unreachable), once because it stopped after 0197 applied with the
# record still empty. The next push brings a third file. Its run must record as
# run before the record began only the files on main before 0197 came, and run
# the first push's two files and the third, in order.
#
# It never connects to the live database and reads no secret. Run after
# start-scratch-postgres.sh, from the repository's root:
#   SCRATCH_SERVER_URL='postgresql://postgres@127.0.0.1:54329' ./scripts/migrations/prove-first-run-that-never-began.sh

set -euo pipefail

readonly repositoryRoot="$(pwd)"
readonly runner="$repositoryRoot/scripts/run-added-migrations.sh"
readonly server="${SCRATCH_SERVER_URL:?Set SCRATCH_SERVER_URL to the scratch Postgres server}"
readonly proofDatabase='ybt_record_never_begun'
readonly proofUrl="$server/$proofDatabase"

source "$(dirname "$0")/prove-migration-record-steps.sh"

mergeAsAPullRequest() {
	git switch --quiet --create "$1"
	"$2"
	commitAll "$1" > /dev/null
	git switch --quiet -
	git -c user.name='Migration record proof' -c user.email='proof@localhost' merge --quiet --no-ff --no-edit "$1"
	git rev-parse HEAD
}

addTheRecordAndTwoFiles() {
	cp "$repositoryRoot/migrations/0197_applied_migrations.sql" migrations/
	writeTableMigration 0201_first_things.sql first_things
	writeTableMigration 0202_second_things.sql second_things
}

addAThirdFile() {
	writeTableMigration 0203_third_things.sql third_things
}

proveTheNextPushFinishesIt() {
	local howTheFirstRunEnded="$1" stepBeforeTheNextPush="$2"
	local proofRepository
	proofRepository="$(mktemp -d)"
	cd "$proofRepository"
	makeTheDatabaseAsItStandsBeforeTheRecord
	git branch --quiet --move main
	mainBeforeTheRecord=$(commitAll 'main before the record')
	firstPush=$(mergeAsAPullRequest the-record-and-two-files addTheRecordAndTwoFiles)
	"$stepBeforeTheNextPush"
	secondPush=$(mergeAsAPullRequest a-third-file addAThirdFile)
	runTheDeploy "$firstPush" "$secondPush" green
	expectRecord "0146_data_inventories.sql run_before_record
0150_old_things.sql run_before_record
0197_applied_migrations.sql run_by_deploy
0201_first_things.sql run_by_deploy
0202_second_things.sql run_by_deploy
0203_third_things.sql run_by_deploy"
	expectRanExactly '0197_applied_migrations.sql 0201_first_things.sql 0202_second_things.sql 0203_third_things.sql'
	expectTable first_things t
	expectTable third_things t
	cd "$repositoryRoot"
	rm -rf "${proofRepository:?}"
	echo "Proved: when the push that brought the record $howTheFirstRunEnded, the next push's run recorded only the files on main before the record came, and ran the first push's files and its own, in order."
}

nothingReachedTheDatabase() {
	return 0
}

applyTheRecordMigrationAlone() {
	queryProof --file migrations/0197_applied_migrations.sql > /dev/null 2>&1
}

proveTheNextPushFinishesIt 'never ran' nothingReachedTheDatabase
proveTheNextPushFinishesIt 'stopped after 0197 applied, with the record still empty' applyTheRecordMigrationAlone
