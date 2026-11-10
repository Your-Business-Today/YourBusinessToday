#!/usr/bin/env bash
# Starts the throwaway Postgres server the migration rehearsal runs on, in a
# container that listens on 127.0.0.1 alone and trusts local connections. It
# holds nothing but what the rehearsal builds in it: no client data, and nothing
# from production is ever copied into it. The Postgres major version is stated
# in rehearsal-postgres.sh and nowhere else.
#
# Prints the server's address and, inside GitHub Actions, sets it as
# SCRATCH_SERVER_URL for the steps after this one.
#
# Usage: ./scripts/migrations/start-scratch-postgres.sh

set -euo pipefail

source "$(dirname "$0")/rehearsal-postgres.sh"

readonly postgresImage="postgres:$rehearsalPostgresMajorVersion"
readonly containerName='ybt-scratch-postgres'
readonly port='54329'
readonly serverUrl="postgresql://postgres@127.0.0.1:$port"
readonly secondsToWait=60

failWith() {
	echo "::error::$1"
	exit 1
}

startContainer() {
	docker run --detach --rm --name "$containerName" \
		--env POSTGRES_HOST_AUTH_METHOD=trust \
		--publish "127.0.0.1:$port:5432" \
		"$postgresImage" \
		-c fsync=off -c synchronous_commit=off -c full_page_writes=off > /dev/null
}

isAcceptingConnections() {
	psql "$serverUrl/postgres" --no-psqlrc --quiet --command 'select 1' > /dev/null 2>&1
}

waitUntilAccepting() {
	for _ in $(seq "$secondsToWait"); do
		if isAcceptingConnections; then
			return 0
		fi
		sleep 1
	done
	failWith "The scratch Postgres ($postgresImage) did not accept connections within $secondsToWait seconds."
}

startContainer
waitUntilAccepting
echo "Scratch Postgres ($postgresImage) is up at $serverUrl"
echo "SCRATCH_SERVER_URL=$serverUrl" >> "${GITHUB_ENV:-/dev/null}"
