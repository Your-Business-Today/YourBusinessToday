#!/usr/bin/env bash
# Proves on a scratch database that the deploy's runner keeps its record of
# applied migrations as it promises, with five invented files in a throwaway
# git repository beside the real data_inventories (0146) and record (0197)
# migrations:
#
# 1. A first run against a database with no record: the record's own migration
#    is applied first and the files already on main are recorded without being
#    run. Each new file carries its own begin and commit, as the real ones do;
#    the first two are applied and recorded, and the third fails part way, so it
#    leaves no record and none of its changes, and the fourth and fifth are not
#    run.
# 2. After the third is corrected in place, a run stopped while the fourth runs,
#    as a cancelled workflow would be: the third is applied and recorded, and the
#    fourth leaves no record and none of its changes.
# 3. The next run finishes it: the fourth and fifth are applied, and no file is
#    run twice.
# 4. After a recorded file was edited: the file is named in a warning and not
#    run, and nothing else runs.
# 5. A file whose statement after its own commit fails: what it committed stays
#    applied and on the record, so it is not run again, and the run goes red
#    saying so.
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
expectTable first_things t
expectTable second_things t
expectTable third_things f
expectOutputHas '0203_third_things.sql failed and was rolled back with its record'
expectRanExactly '0197_applied_migrations.sql 0201_first_things.sql 0202_second_things.sql 0203_third_things.sql'
echo "Proved: the first run began the record without running the files already on main; each file with its own begin and commit was recorded exactly when it applied, and the third, failing part way, left no record and none of its changes."

correctTheThirdFileInPlace
pushWithTheCorrection=$(commitAll 'the third file corrected in place')
stopTheDeployDuringTheSlowFile "$pushWithAFailure" "$pushWithTheCorrection"
expectRecord "0146_data_inventories.sql run_before_record
0150_old_things.sql run_before_record
0197_applied_migrations.sql run_by_deploy
0201_first_things.sql run_by_deploy
0202_second_things.sql run_by_deploy
0203_third_things.sql run_by_deploy"
expectTable third_things t
expectTable fourth_things f
echo "Proved: a run stopped while the fourth file ran kept the third on the record and left no record and none of the changes of the fourth."

runTheDeploy "$pushWithAFailure" "$pushWithTheCorrection" green
expectRecord "0146_data_inventories.sql run_before_record
0150_old_things.sql run_before_record
0197_applied_migrations.sql run_by_deploy
0201_first_things.sql run_by_deploy
0202_second_things.sql run_by_deploy
0203_third_things.sql run_by_deploy
0204_fourth_things.sql run_by_deploy
0205_fifth_things.sql run_by_deploy"
expectTable fourth_things t
expectTable fifth_things t
expectRanExactly '0204_fourth_things.sql 0205_fifth_things.sql'
echo "Proved: the next run finished the stopped one, applying the fourth and fifth files and running no file twice."

editARecordedFile
pushWithAnEdit=$(commitAll 'a recorded file edited')
runTheDeploy "$pushWithTheCorrection" "$pushWithAnEdit" green
expectOutputHas '::warning::0201_first_things.sql has changed since it was applied, so it is not run again.'
expectOutputHas 'Every migration on main is on the record, so none is waiting.'
expectRanExactly ''
echo "Proved: a recorded file that was edited is named in a warning and not run again."

addAFileThatFailsAfterItsOwnCommit
pushWithALateFailure=$(commitAll 'a file that fails after its own commit')
runTheDeploy "$pushWithAnEdit" "$pushWithALateFailure" red
expectTable sixth_things t
expectOutputHas '0206_sixth_things.sql committed and was recorded, then a statement after its own commit failed.'
runTheDeploy "$pushWithAnEdit" "$pushWithALateFailure" green
expectRanExactly ''
echo "Proved: a file that committed and then failed after its own commit stays on the record with what it committed, and is not run again."
