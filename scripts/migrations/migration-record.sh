# The record of applied migrations, public.applied_migrations (0197), as the
# deploy's runner and the rehearsal read and write it. Each file is recorded by
# its name under migrations/, with a fingerprint of its contents, so a recorded
# file that is edited later can be named. Sourced, never run; every function
# takes the database's address first.

readonly migrationRecordQueries="$(dirname "${BASH_SOURCE[0]}")"
readonly migrationsFolder='migrations'

queryRecord() {
	local databaseUrl="$1"
	shift
	psql "$databaseUrl" --no-psqlrc --quiet --tuples-only --no-align --set ON_ERROR_STOP=on "$@"
}

readonly isTableThereQuery="select to_regclass('public.applied_migrations') is not null"
readonly hasRowsQuery='select exists (select from public.applied_migrations)'

isRecordTableThere() {
	local isThere
	isThere=$(queryRecord "$1" --command "$isTableThereQuery") || return 1
	[ "$isThere" = 't' ]
}

readRecordState() {
	local answer
	answer=$(queryRecord "$1" --command "$isTableThereQuery") || return 1
	if [ "$answer" = 't' ]; then
		answer=$(queryRecord "$1" --command "$hasRowsQuery") || return 1
	fi
	if [ "$answer" = 't' ]; then
		echo 'begun'
		return 0
	fi
	echo 'not begun'
}

listRecordedMigrations() {
	queryRecord "$1" --file "$migrationRecordQueries/recorded-migrations.sql"
}

listMigrationsInWorkingTree() {
	find "$migrationsFolder" -maxdepth 1 -name '*.sql' -printf '%f\n' | LC_ALL=C sort
}

listMigrationsAtCommit() {
	git ls-tree --name-only "$1" "$migrationsFolder/" | { grep '\.sql$' || true; } | xargs -r -n1 basename | LC_ALL=C sort
}

fingerprintOfFile() {
	sha256sum < "$migrationsFolder/$1" | cut -d' ' -f1
}

fingerprintAtCommit() {
	git show "$1:$migrationsFolder/$2" | sha256sum | cut -d' ' -f1
}

asFingerprintJson() {
	local entries
	entries=$(while read -r fileName fingerprint; do
		printf '"%s":"%s"\n' "$fileName" "$fingerprint"
	done | paste -sd, -)
	echo "{$entries}"
}

recordMigrations() {
	local databaseUrl="$1" commit="$2" howApplied="$3" fingerprints="$4"
	queryRecord "$databaseUrl" --file "$migrationRecordQueries/record-applied-migrations.sql" \
		--set commit="$commit" --set howApplied="$howApplied" --set fingerprints="$fingerprints"
}

recordAppliedMigration() {
	local databaseUrl="$1" commit="$2" fileName="$3"
	recordMigrations "$databaseUrl" "$commit" run_by_deploy \
		"$(echo "$fileName $(fingerprintOfFile "$fileName")" | asFingerprintJson)"
}

recordMigrationsAtCommitAsRunBefore() {
	local databaseUrl="$1" commit="$2" fileNames="$3"
	local fingerprints
	fingerprints=$(while IFS= read -r fileName; do
		if [ -n "$fileName" ]; then
			echo "$fileName $(fingerprintAtCommit "$commit" "$fileName")"
		fi
	done <<< "$fileNames" | asFingerprintJson)
	recordMigrations "$databaseUrl" "$commit" run_before_record "$fingerprints"
}

listWaitingMigrations() {
	local recordedNames
	recordedNames=$(listRecordedMigrations "$1" | cut -d' ' -f1) || return 1
	LC_ALL=C comm -23 <(listMigrationsInWorkingTree) <(printf '%s\n' "$recordedNames")
}

listChangedSinceRecorded() {
	local recorded
	recorded=$(listRecordedMigrations "$1") || return 1
	while read -r fileName recordedFingerprint; do
		[ -f "$migrationsFolder/$fileName" ] || continue
		[ "$(fingerprintOfFile "$fileName")" = "$recordedFingerprint" ] || echo "$fileName"
	done <<< "$recorded"
}
