#!/usr/bin/env bash
# Runs one migration file against the Supabase Postgres database, locally and
# deliberately — the psql equivalent of a hand-run sqlcmd script. Merged
# migrations run by themselves (scripts/run-added-migrations.sh); this is for
# running or re-running one by hand. The whole file runs in a single
# transaction and aborts on the first error, so a failed migration leaves the
# database untouched.
#
# Setup (once):
#   brew install libpq && brew link --force libpq   # provides psql on macOS
#   Set SUPABASE_DB_URL in your shell or .env — Supabase Dashboard → Connect →
#   Session pooler connection string (postgresql://postgres...@...:5432/postgres).
#
# Usage:
#   SUPABASE_DB_URL='postgresql://...' ./scripts/run-migration.sh migrations/0001_domain_brain.sql

set -euo pipefail

migrationFile="${1:-}"

if [ -z "$migrationFile" ]; then
	echo "Usage: ./scripts/run-migration.sh <migrations/file.sql>"
	exit 1
fi

if [ ! -f "$migrationFile" ]; then
	echo "No such migration file: $migrationFile"
	exit 1
fi

if [ -z "${SUPABASE_DB_URL:-}" ]; then
	echo "SUPABASE_DB_URL is not set — copy the Session pooler connection string"
	echo "from the Supabase dashboard (Connect) and export it first."
	exit 1
fi

targetHost=$(printf '%s' "$SUPABASE_DB_URL" | sed -E 's|.*@([^:/?]+).*|\1|')

echo "Migration: $migrationFile"
echo "Target:    $targetHost"
echo "The file will run as ONE transaction and roll back entirely on any error."
read -r -p "Type RUN to continue: " confirmation

if [ "$confirmation" != "RUN" ]; then
	echo "Aborted — nothing was run."
	exit 1
fi

psql "$SUPABASE_DB_URL" \
	--single-transaction \
	--set ON_ERROR_STOP=on \
	--file "$migrationFile"

echo "Migration applied: $migrationFile"
