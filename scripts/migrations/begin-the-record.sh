# The first run of the deploy's runner, when there is no record of applied
# migrations yet: it applies the record's own migration before any other, then
# records every file that was on main before the push as run before the record
# began, without running any of them, so only the files the push added are run.
# Sourced by scripts/run-added-migrations.sh, never run; reads its beforeCommit,
# SUPABASE_DB_URL, failWith, runMigration and readWaitingMigrations.

readonly recordMigration='0197_applied_migrations.sql'
readonly commitThatDoesNotExist='0000000000000000000000000000000000000000'

requireCommitBefore() {
	if [ "$beforeCommit" = "$commitThatDoesNotExist" ] || ! git cat-file -e "$beforeCommit^{commit}" 2> /dev/null; then
		failWith "This push has no previous commit to compare with, so the migrations already on main cannot be told apart from the ones it added. Nothing was run."
	fi
}

readMigrationsOnMainBefore() {
	migrationsOnMainBefore=$(listMigrationsAtCommit "$beforeCommit") || failWith "The migrations on main before this push could not be listed, so no migration was run."
	if [ -z "$migrationsOnMainBefore" ]; then
		failWith "No migration was on main before this push, which cannot be right, so no migration was run."
	fi
}

beginTheRecord() {
	echo "There is no record of applied migrations yet, so this run begins it with $recordMigration."
	migrationsThisRun="$recordMigration"$'\n'
	runMigration "$recordMigration" || return 1
	recordMigrationsAtCommitAsRunBefore "$SUPABASE_DB_URL" "$beforeCommit" "$migrationsOnMainBefore" \
		|| failWith "The files already on main could not be recorded as run before the record began."
	echo "Recorded the $(wc -l <<< "$migrationsOnMainBefore") files on main before this push as run before the record began; none of them was run."
	readWaitingMigrations
	echo "Migrations this push added, besides the record's own: ${waitingMigrations:-none}"
}
