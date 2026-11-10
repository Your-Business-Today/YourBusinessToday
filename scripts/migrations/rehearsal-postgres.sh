# The Postgres major version the migration rehearsal runs on, stated here and
# nowhere else. start-scratch-postgres.sh starts this version, and the deploy's
# runner warns when the live database runs another, since a rehearsal on one
# version is weaker proof for another. Sourced, never run; reportPostgresVersion
# reads the runner's SUPABASE_DB_URL, queryRecord and failWith.
readonly rehearsalPostgresMajorVersion='17'

reportPostgresVersion() {
	local version majorVersion
	version=$(queryRecord "$SUPABASE_DB_URL" --command 'show server_version') || failWith "The database could not be reached, so no migration was run."
	majorVersion=$(queryRecord "$SUPABASE_DB_URL" --command "select current_setting('server_version_num')::int / 10000")
	echo "The database runs Postgres $version."
	if [ "$majorVersion" != "$rehearsalPostgresMajorVersion" ]; then
		echo "::warning::The database runs Postgres $majorVersion but the rehearsal runs on Postgres $rehearsalPostgresMajorVersion (scripts/migrations/rehearsal-postgres.sh), so the rehearsal is weaker proof. Move the rehearsal to $majorVersion."
	fi
}
