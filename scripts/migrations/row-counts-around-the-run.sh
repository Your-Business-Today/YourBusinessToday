# The data inventory the deploy's runner takes around its migrations: every
# table's row count before the first file and after the last, kept in
# data_inventories, and the red run naming each table that has fewer rows after
# than before. Sourced by scripts/run-added-migrations.sh, never run; reads
# SUPABASE_DB_URL and the runner's failWith.

readonly rowCountQueries="$(dirname "${BASH_SOURCE[0]}")"

queryInventory() {
	psql "$SUPABASE_DB_URL" --no-psqlrc --quiet --tuples-only --no-align --set ON_ERROR_STOP=on "$@"
}

countEveryTable() {
	queryInventory --file "$rowCountQueries/count-every-table.sql"
}

currentTime() {
	date -u +%Y-%m-%dT%H:%M:%S.%NZ
}

takeRowsBefore() {
	beforeTakenAt=$(currentTime)
	rowsBefore=$(countEveryTable) || failWith "The row counts could not be taken, so no migration was run."
}

takeRowsAfter() {
	afterTakenAt=$(currentTime)
	rowsAfter=$(countEveryTable) || failWith "The row counts after the migrations could not be taken, so nobody can tell whether rows were lost."
}

asTextArray() {
	echo "{$(grep -v '^$' <<< "$1" | paste -sd, -)}"
}

keepInventory() {
	local commit="$1" migrationFiles="$2"
	queryInventory --file "$rowCountQueries/keep-data-inventory.sql" \
		--set commit="$commit" --set files="$(asTextArray "$migrationFiles")" \
		--set before="$rowsBefore" --set beforeTakenAt="$beforeTakenAt" \
		--set after="$rowsAfter" --set afterTakenAt="$afterTakenAt" \
		|| echo "::warning::The row counts were checked but could not be kept in data_inventories."
}

listTablesWithFewerRows() {
	queryInventory --file "$rowCountQueries/tables-with-fewer-rows.sql" --set before="$rowsBefore" --set after="$rowsAfter"
}

requireNoRowsLost() {
	local tablesWithFewerRows
	tablesWithFewerRows=$(listTablesWithFewerRows) || failWith "The row counts before and after could not be compared."
	if [ -z "$tablesWithFewerRows" ]; then
		echo "No table has fewer rows than before the migrations."
		return 0
	fi
	while IFS= read -r tableWithFewerRows; do
		echo "::error::$tableWithFewerRows"
	done <<< "$tablesWithFewerRows"
	failWith "Rows went missing while the migrations ran. Find what removed them before anything else merges; the daily backup holds them."
}
