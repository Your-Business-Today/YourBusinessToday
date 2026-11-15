#!/usr/bin/env bash
# What .github/workflows/ci.yml runs on a pull request, in the same order: its
# job Run test suite, which is the required check. Its other job, check, runs
# the same type check, so that is run once here. scripts/check-before-push.sh
# runs this file, after `npm ci`.
#
# GitHub reads a pull request against the commit its base branch stands at.
# Every pull request here goes into staging, so here the base is the commit the
# work left staging at, where this clone's history reaches that far, and
# otherwise staging as the clone last fetched it. A clone that has never
# fetched staging reads the work against the default branch: more is checked,
# never less.
#
# The checks of the migrations read commits, as GitHub does, and not the
# working folder. So what the deploy runs is committed before it is checked:
# work there that is not committed ends the checks with a sentence saying so.

set -euo pipefail

readonly baseBranch='origin/staging'
readonly defaultBranch='origin/main'

# ci.yml's own list: a pull request that changes any of these has its
# migrations rehearsed.
readonly whatTheDeployRuns=(
	migrations
	scripts/run-added-migrations.sh
	scripts/migrations
	docs/sql/base-schema.sql
	docs/sql/fix-everything.sql
	.github/workflows/ci.yml
)

# The two settings GitHub gives the job from the repository's variables. Where
# neither is set these stand in for them: no check reaches Supabase.
export PUBLIC_SUPABASE_URL="${PUBLIC_SUPABASE_URL:-https://supabase-stand-in.example}"
export PUBLIC_SUPABASE_PUBLISHABLE_KEY="${PUBLIC_SUPABASE_PUBLISHABLE_KEY:-stand-in-publishable-key}"

failWith() {
	echo "$1" >&2
	exit 1
}

commitOf() {
	git rev-parse --verify --quiet "$1^{commit}"
}

findTheBaseCommit() {
	git merge-base "$baseBranch" HEAD 2> /dev/null || commitOf "$baseBranch" || commitOf "$defaultBranch" ||
		failWith "This clone knows neither $baseBranch nor $defaultBranch, so the checks cannot tell what this pull request changes. Fetch them first: git fetch origin staging main."
}

refuseDeployWorkNotCommitted() {
	local workNotCommitted
	workNotCommitted="$(git status --porcelain --untracked-files=all -- "${whatTheDeployRuns[@]}")"
	if [ -z "$workNotCommitted" ]; then
		return 0
	fi
	echo "$workNotCommitted" >&2
	failWith "What the deploy runs holds work that is not committed (above). The checks of the migrations read commits, as GitHub does: commit it, then run the checks again."
}

rehearseWhenTheDeployChanges() {
	local baseCommit="$1" changedFiles
	changedFiles="$(git diff --name-only "$baseCommit" HEAD -- "${whatTheDeployRuns[@]}")"
	if [ -z "$changedFiles" ]; then
		return 0
	fi
	echo "This pull request changes what the deploy runs:"
	echo "$changedFiles"
	scripts/checks/migration-rehearsal.sh
}

refuseDeployWorkNotCommitted
baseCommit="$(findTheBaseCommit)"
node scripts/migrations/check-added-migrations.mjs "$baseCommit"
rehearseWhenTheDeployChanges "$baseCommit"
npm run check
npm test
npm run build
