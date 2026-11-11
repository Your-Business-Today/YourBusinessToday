# The first run of the deploy's runner, when there is no record of applied
# migrations yet: it applies the record's own migration before any other, then
# records every file that was on main before the push as run before the record
# began, without running any of them, so only the files the push added are run.
# When the push before already holds the record's migration, the run that should
# have begun the record never did (cancelled, the database unreachable, the
# record's migration failed, or a database restored from before the record), so
# the files on main before the record's migration came are taken instead: main
# moves only by merged pull requests, one commit each on its first-parent line,
# so the commit that brought it is found by walking back along first parents.
# A restored database is only right this way when its backup was taken after
# every file on main before the record's migration had run: with an older
# backup the run goes green and records as run files whose changes the restored
# database does not hold, so after such a restore begin the record by hand.
# Those files and the record's own migration go on the record in one
# transaction, so a run that stops there leaves the record empty and the next
# run begins it again; the record's migration is safe to run twice. Sourced by
# scripts/run-added-migrations.sh, never run; reads its beforeCommit,
# afterCommit, SUPABASE_DB_URL, failWith, failedMigration and
# readWaitingMigrations.

readonly recordMigration='0197_applied_migrations.sql'
readonly commitThatDoesNotExist='0000000000000000000000000000000000000000'

requireCommitBefore() {
	if [ "$beforeCommit" = "$commitThatDoesNotExist" ] || ! git cat-file -e "$beforeCommit^{commit}" 2> /dev/null; then
		failWith "This push has no previous commit to compare with, so the migrations already on main cannot be told apart from the ones it added. Nothing was run."
	fi
}

holdsTheRecordMigration() {
	git cat-file -e "$1:migrations/$recordMigration" 2> /dev/null
}

findCommitThatBroughtTheRecord() {
	git log --first-parent --diff-merges=first-parent --diff-filter=A --no-patch --format=%H -1 "$beforeCommit" -- "migrations/$recordMigration"
}

findBaselineCommit() {
	if ! holdsTheRecordMigration "$beforeCommit"; then
		baselineCommit="$beforeCommit"
		return 0
	fi
	local commitThatBroughtTheRecord
	commitThatBroughtTheRecord=$(findCommitThatBroughtTheRecord) || failWith "The commit that brought $recordMigration to main could not be found, so no migration was run."
	if [ -z "$commitThatBroughtTheRecord" ] || ! git cat-file -e "$commitThatBroughtTheRecord^1" 2> /dev/null; then
		failWith "Main already held $recordMigration before this push but the record was never begun, and the commit that brought it could not be found along main's first parents, so no migration was run. Begin the record by hand."
	fi
	baselineCommit=$(git rev-parse "$commitThatBroughtTheRecord^1")
	echo "Main already held $recordMigration before this push, but the record was never begun, so the files on main before ${commitThatBroughtTheRecord:0:7} brought it are taken as run before the record."
}

readMigrationsOnMainBefore() {
	findBaselineCommit
	migrationsOnMainBefore=$(listMigrationsAtCommit "$baselineCommit") || failWith "The migrations on main before the record could not be listed, so no migration was run."
	if [ -z "$migrationsOnMainBefore" ]; then
		failWith "No migration was on main before this push, which cannot be right, so no migration was run."
	fi
}

applyTheRecordMigration() {
	echo "Running $recordMigration"
	if psql "$SUPABASE_DB_URL" --single-transaction --set ON_ERROR_STOP=on --file "migrations/$recordMigration"; then
		return 0
	fi
	echo "::error::$recordMigration failed and was rolled back, so there is still no record; no other migration was run."
	failedMigration="$recordMigration"
	return 1
}

recordTheBeginning() {
	psql "$SUPABASE_DB_URL" --no-psqlrc --quiet --single-transaction --set ON_ERROR_STOP=on \
		--set beforeCommit="$baselineCommit" \
		--set beforeFingerprints="$(fingerprintsAtCommitAsJson "$baselineCommit" "$migrationsOnMainBefore")" \
		--set commit="$afterCommit" --set recordFingerprints="$(fingerprintJsonOfFile "$recordMigration")" \
		--file "$(dirname "${BASH_SOURCE[0]}")/begin-the-record.sql" > /dev/null
}

beginTheRecord() {
	echo "There is no record of applied migrations yet, so this run begins it with $recordMigration."
	migrationsThisRun="$recordMigration"$'\n'
	applyTheRecordMigration || return 1
	if ! recordTheBeginning; then
		echo "::error::$recordMigration applied, but the record could not be begun, so it stays empty and the next run begins it again. No other migration was run."
		failedMigration="$recordMigration"
		return 1
	fi
	echo "Applied and recorded $recordMigration, and recorded the $(wc -l <<< "$migrationsOnMainBefore") files on main at ${baselineCommit:0:7} as run before the record began; none of them was run."
	readWaitingMigrations
	echo "Migrations waiting besides the record's own:"
	echo "${waitingMigrations:-none}"
}
