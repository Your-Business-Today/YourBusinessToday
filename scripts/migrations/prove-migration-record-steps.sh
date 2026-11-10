# The steps prove-migration-record.sh takes: the invented migration files, the
# commits that bring them, each run of the deploy's runner and what is checked
# after it. Sourced by that script, never run; reads its repositoryRoot,
# runner, server, proofDatabase and proofUrl.

runOutput=''

failWith() {
	echo "::error::$1"
	exit 1
}

queryProof() {
	psql "$proofUrl" --no-psqlrc --quiet --tuples-only --no-align --set ON_ERROR_STOP=on "$@"
}

writeMigration() {
	cat > "migrations/$1"
}

writeTableMigration() {
	writeMigration "$1" <<< "create table $2 (id int primary key); insert into $2 values (1);"
}

commitAll() {
	git add --all
	git -c user.name='Migration record proof' -c user.email='proof@localhost' commit --quiet --message "$1"
	git rev-parse HEAD
}

makeTheDatabaseAsItStandsBeforeTheRecord() {
	git init --quiet
	mkdir migrations
	cp "$repositoryRoot/migrations/0146_data_inventories.sql" migrations/
	writeTableMigration 0150_old_things.sql old_things
	psql "$server/postgres" --no-psqlrc --quiet --set ON_ERROR_STOP=on \
		--command "drop database if exists $proofDatabase" --command "create database $proofDatabase"
	for fileName in 0146_data_inventories.sql 0150_old_things.sql; do
		queryProof --file "migrations/$fileName" > /dev/null 2>&1
	done
}

addTheRecordAndFiveFilesTheThirdFailing() {
	cp "$repositoryRoot/migrations/0197_applied_migrations.sql" migrations/
	writeTableMigration 0201_first_things.sql first_things
	writeTableMigration 0202_second_things.sql second_things
	writeMigration 0203_third_things.sql <<< "create table third_things (id int primary key); select 1 / 0;"
	writeTableMigration 0204_fourth_things.sql fourth_things
	writeTableMigration 0205_fifth_things.sql fifth_things
}

correctTheThirdFileInPlace() {
	writeTableMigration 0203_third_things.sql third_things
}

editARecordedFile() {
	echo "insert into first_things values (2);" >> migrations/0201_first_things.sql
}

runTheDeploy() {
	local beforeCommit="$1" afterCommit="$2" expectedOutcome="$3"
	local outcome=green
	echo "::group::The deploy's runner from ${beforeCommit:0:7} to ${afterCommit:0:7}, expected $expectedOutcome"
	runOutput=$(SUPABASE_DB_URL="$proofUrl" "$runner" "$beforeCommit" "$afterCommit" 2>&1) || outcome=red
	echo "$runOutput"
	echo "::endgroup::"
	[ "$outcome" = "$expectedOutcome" ] || failWith "The run went $outcome where $expectedOutcome was expected."
}

expectRecord() {
	local record
	record=$(queryProof --command "select file_name || ' ' || how_applied from public.applied_migrations order by file_name collate \"C\"")
	[ "$record" = "$1" ] || failWith "The record holds:
$record
where it should hold:
$1"
}

expectOutputHas() {
	grep --quiet --fixed-strings -- "$1" <<< "$runOutput" || failWith "The run did not say: $1"
}

expectOutputLacks() {
	if grep --quiet --fixed-strings -- "$1" <<< "$runOutput"; then
		failWith "The run said what it should not have: $1"
	fi
}

expectRanExactly() {
	local filesRun
	filesRun=$(grep '^Running ' <<< "$runOutput" | cut -d' ' -f2 | paste -sd' ' -) || true
	[ "$filesRun" = "$1" ] || failWith "The run ran '$filesRun' where it should have run '$1'."
}
