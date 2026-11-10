#!/usr/bin/env bash
# Proves on a scratch database that the deploy's runner keeps its record of
# applied migrations as it promises, with five invented files in a throwaway
# git repository beside the real data_inventories (0146) and record (0197)
# migrations:
#
# 1. A first run against a database with no record: the record's own migration
#    is applied first, the files already on main are recorded without being run,
#    and the third of five new files fails, so the fourth and fifth are not run.
# 2. A second run, after the third is corrected in place: the third, fourth and
#    fifth are applied, and nothing else is run again.
# 3. A third run, after a recorded file was edited: the file is named in a
#    warning and not run, and nothing else runs.
#
# The invented files are not safe to run twice on purpose, so running one again
# would fail the run. It never connects to the live database and reads no
# secret. Run after start-scratch-postgres.sh, from the repository's root:
#   SCRATCH_SERVER_URL='postgresql://postgres@127.0.0.1:54329' ./scripts/migrations/prove-migration-record.sh

set -euo pipefail

readonly repositoryRoot="$(pwd)"
readonly runner="$repositoryRoot/scripts/run-added-migrations.sh"
readonly server="${SCRATCH_SERVER_URL:?Set SCRATCH_SERVER_URL to the scratch Postgres server}"
readonly proofDatabase='ybt_record_proof'
readonly proofUrl="$server/$proofDatabase"

source "$(dirname "$0")/prove-migration-record-steps.sh"

proofRepository="$(mktemp -d)"
trap 'rm -rf "$proofRepository"' EXIT
cd "$proofRepository"

makeTheDatabaseAsItStandsBeforeTheRecord
mainBeforeTheRecord=$(commitAll 'main before the record')

addTheRecordAndFiveFilesTheThirdFailing
pushWithAFailure=$(commitAll 'the record and five files, the third failing')
runTheDeploy "$mainBeforeTheRecord" "$pushWithAFailure" red
expectRecord "0146_data_inventories.sql run_before_record
0150_old_things.sql run_before_record
0197_applied_migrations.sql run_by_deploy
0201_first_things.sql run_by_deploy
0202_second_things.sql run_by_deploy"
expectOutputHas '0203_third_things.sql failed and was rolled back'
expectOutputLacks 'Running 0204_fourth_things.sql'
expectOutputLacks 'Running 0150_old_things.sql'
echo "Proved: the first run began the record without running the files already on main, and stopped at the third file."

correctTheThirdFileInPlace
pushWithTheCorrection=$(commitAll 'the third file corrected in place')
runTheDeploy "$pushWithAFailure" "$pushWithTheCorrection" green
expectRecord "0146_data_inventories.sql run_before_record
0150_old_things.sql run_before_record
0197_applied_migrations.sql run_by_deploy
0201_first_things.sql run_by_deploy
0202_second_things.sql run_by_deploy
0203_third_things.sql run_by_deploy
0204_fourth_things.sql run_by_deploy
0205_fifth_things.sql run_by_deploy"
expectRanExactly '0203_third_things.sql 0204_fourth_things.sql 0205_fifth_things.sql'
echo "Proved: the next run applied the third, fourth and fifth files and nothing else."

editARecordedFile
pushWithAnEdit=$(commitAll 'a recorded file edited')
runTheDeploy "$pushWithTheCorrection" "$pushWithAnEdit" green
expectOutputHas '::warning::0201_first_things.sql has changed since it was applied, so it is not run again.'
expectOutputHas 'Every migration on main is on the record, so none is waiting.'
expectRanExactly ''
echo "Proved: a recorded file that was edited is named in a warning and not run again."
