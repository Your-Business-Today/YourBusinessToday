#!/usr/bin/env bash
# A Postgres server for the checks before a push alone, made from this machine's
# own PostgreSQL where GitHub starts one from Docker. It is made new in a folder
# of its own, answers only through a socket in that folder, and is stopped and
# removed with it as the checks end: no database anyone uses is touched.
#
#   scripts/checks/scratch-postgres.sh start            prints the folder
#   scripts/checks/scratch-postgres.sh stop <folder>
#
# The server answers on PGPORT as PGUSER, which the caller names. Where no
# server can be had on this machine, nothing is left running and the answer is
# 69, the project-process kit's answer for what cannot be had here.

set -euo pipefail

readonly cannotBeHadHere=69
readonly wrongUse=64
readonly serversAccount='postgres'
# A socket's path holds about a hundred bytes, which a long TMPDIR would pass.
readonly folderPattern='/tmp/ybt-checks.XXXXXX'
# Its data is thrown away, so nothing waits for the disk; no network reaches it.
readonly serverSettings="-c listen_addresses='' -c fsync=off -c synchronous_commit=off -c full_page_writes=off"

cannotBeHad() {
	echo "No scratch Postgres was started: $1." >&2
	exit "$cannotBeHadHere"
}

isRoot() { [ "$(id -u)" -eq 0 ]; }

# PostgreSQL refuses to run as root, so root runs it as the server's own account.
asTheServersAccount() {
	if isRoot; then set -- runuser -u "$serversAccount" -- "$@"; fi
	"$@"
}

findTheServersPrograms() {
	command -v pg_config > /dev/null || cannotBeHad "PostgreSQL is not installed on this machine"
	local programs
	programs="$(pg_config --bindir)"
	[ -x "$programs/initdb" ] || cannotBeHad "this machine has PostgreSQL's client programs and not its server"
	if isRoot && ! id "$serversAccount" > /dev/null 2>&1; then
		cannotBeHad "the checks run as root here, and there is no $serversAccount account to run the server as"
	fi
	echo "$programs"
}

makeItsData() {
	local folder="$1" programs="$2"
	asTheServersAccount "$programs/initdb" -D "$folder/data" -U "$PGUSER" -A trust -E UTF8 --no-sync \
		> "$folder/initdb.log" 2>&1
}

startItAnswering() {
	local folder="$1" programs="$2"
	asTheServersAccount "$programs/pg_ctl" -D "$folder/data" -l "$folder/server.log" -w \
		-o "-c port=$PGPORT -c unix_socket_directories=$folder $serverSettings" start >&2
}

stopItAnswering() {
	local folder="$1" programs="$2"
	asTheServersAccount "$programs/pg_ctl" -D "$folder/data" -m immediate -w stop >&2
}

wouldNotStart() {
	local folder="$1" programs="$2"
	cat "$folder/initdb.log" "$folder/server.log" >&2 2> /dev/null || true
	stopItAnswering "$folder" "$programs" 2> /dev/null || true
	rm -rf -- "${folder:?}"
	cannotBeHad "PostgreSQL would not start on this machine, for the reason above"
}

start() {
	local programs folder
	programs="$(findTheServersPrograms)"
	folder="$(mktemp -d "$folderPattern")"
	if isRoot; then chown "$serversAccount" "$folder"; fi
	makeItsData "$folder" "$programs" && startItAnswering "$folder" "$programs" || wouldNotStart "$folder" "$programs"
	echo "$folder"
}

# Only a folder this file made is ever removed: one named by the pattern.
isItsOwnFolder() {
	local folder="$1" lettersGiven
	lettersGiven="${folder#"${folderPattern%%X*}"}"
	[[ "$folder" != "$lettersGiven" && "$lettersGiven" =~ ^[[:alnum:]]+$ ]]
}

stop() {
	local folder="$1"
	isItsOwnFolder "$folder" || exit "$wrongUse"
	stopItAnswering "$folder" "$(pg_config --bindir)" || true
	rm -rf -- "${folder:?}"
}

case "${1:-}" in
	start) start ;;
	stop) stop "${2:?the folder the server was started in}" ;;
	*) echo "Use: scripts/checks/scratch-postgres.sh start | stop <folder>" >&2 && exit "$wrongUse" ;;
esac
