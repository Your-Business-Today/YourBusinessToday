#!/usr/bin/env bash
# What .github/workflows/ci.yml runs when a pull request changes what the deploy
# runs: the next deploy's migrations rehearsed twice on a scratch database, and
# the two proofs of the record of applied migrations. scripts/checks/ci.sh runs
# this file, from the repository's root.
#
# GitHub starts Postgres from Docker for it, at the version
# scripts/migrations/rehearsal-postgres.sh states. Here the server is the
# checks' own, made from this machine's PostgreSQL
# (scripts/checks/scratch-postgres.sh) and stopped and removed as the checks
# end. It may be another version: a rehearsal that fails on it has still
# failed, one that passes has passed on that version, and GitHub's remains the
# proof on the stated one.
#
# The rehearsal's scripts use Linux's own tools, so on any other machine, and
# where no server can be started, the rehearsal and the proofs are named in the
# file NOT_CHECKED_HERE names and the checks go on.

set -euo pipefail

source scripts/migrations/rehearsal-postgres.sh

readonly cannotBeHadHere=69
readonly notCheckedHere="${NOT_CHECKED_HERE:-/dev/stderr}"
readonly defaultBranch='origin/main'
readonly scratchPort='54329'
readonly scratchUser='postgres'

scratchFolder=''

failWith() {
	echo "$1" >&2
	exit 1
}

stopTheScratchServer() {
	if [ -n "$scratchFolder" ]; then
		scripts/checks/scratch-postgres.sh stop "$scratchFolder" || true
	fi
}

nameAsNotChecked() {
	echo "the rehearsal of the next deploy's migrations and the proofs of their record, because $1" >> "$notCheckedHere"
	exit 0
}

# The server's helper answers 69 when none can be had on this machine. Any other
# failure of it ends the checks here.
goOnWithoutAServer() {
	local answerOfTheHelper="$1"
	if [ "$answerOfTheHelper" -ne "$cannotBeHadHere" ]; then
		exit "$answerOfTheHelper"
	fi
	nameAsNotChecked 'no PostgreSQL server can be started here'
}

majorVersionOfTheScratchServer() {
	psql "$SCRATCH_SERVER_URL/postgres" --no-psqlrc --tuples-only --no-align \
		--command "select current_setting('server_version_num')::int / 10000"
}

# The deploy's runner warns when the database it runs on is not the rehearsal's
# version, and here that database is the scratch one.
sayWhenTheVersionIsThisMachinesOwn() {
	local majorVersion
	majorVersion="$(majorVersionOfTheScratchServer)"
	if [ "$majorVersion" = "$rehearsalPostgresMajorVersion" ]; then
		return 0
	fi
	echo "This machine's PostgreSQL is $majorVersion, and GitHub rehearses on $rehearsalPostgresMajorVersion. The runner's warning below is about this machine's scratch server alone: leave scripts/migrations/rehearsal-postgres.sh as it is."
}

if [ "$(uname -s)" != 'Linux' ]; then
	nameAsNotChecked "the rehearsal's scripts use Linux's own tools and this machine is not Linux"
fi

deployedCommit="$(git rev-parse --verify --quiet "$defaultBranch^{commit}")" ||
	failWith "This clone does not know $defaultBranch, where the live database stands, so the rehearsal has nothing to start from. Fetch it first: git fetch origin main."

trap stopTheScratchServer EXIT
scratchFolder="$(PGPORT="$scratchPort" PGUSER="$scratchUser" scripts/checks/scratch-postgres.sh start)" ||
	goOnWithoutAServer $?

# The server answers through a socket in its folder alone, and psql is the
# server's own.
export SCRATCH_SERVER_URL="postgresql://$scratchUser@${scratchFolder//\//%2F}:$scratchPort"
PATH="$(pg_config --bindir):$PATH"

sayWhenTheVersionIsThisMachinesOwn
./scripts/migrations/rehearse-added-migrations.sh "$deployedCommit"
./scripts/migrations/prove-migration-record.sh
./scripts/migrations/prove-first-run-that-never-began.sh
