#!/usr/bin/env bash
# Installed by the project-process kit (re-run its bootstrap to refresh; do not edit by hand).
# The deploy window's two moves, each one pull request that merges itself at green:
#   promote  opens the promotion from the staging branch into the default branch when staging holds
#            changes the default branch lacks, reuses the open one otherwise, and turns auto-merge on.
#   level    after a promotion merges, brings staging level with the default branch: when the two hold
#            the same files the promotion's merge commit is the only difference and nothing is done;
#            when the default branch holds changes staging lacks (an urgent fix merged straight into
#            it), staging is fast-forwarded where its ruleset allows a push, else a pull request from
#            the default branch into staging is opened, merging at green.
# Where the two branches conflict, neither pull request can merge and nothing deploys: the move stops
# red, names the pull request and the files that clash, and says how to put it right, rather than
# leaving a pull request open that never merges.
# Nothing to do is a quiet success. Needs the GitHub CLI signed in as a person or an app (GH_TOKEN),
# never the Actions token, so a pull request runs its checks and the promotion's merge deploys.
#
#   scripts/promote-staging.sh [promote|level] [staging branch] [default branch]
set -euo pipefail

MOVE="promote"
case "${1:-}" in promote|level) MOVE="$1"; shift ;; esac
STAGING="${1:-staging}"
DEFAULT="${2:-main}"
TODAY="$(date -u +%Y-%m-%d)"
LISTED_COMMITS=50
MERGEABILITY_LOOKS=6
SECONDS_BETWEEN_LOOKS=5
MERGEABLE="MERGEABLE"
CONFLICTING="CONFLICTING"

requireToken() {
  if [ -n "${GH_TOKEN:-}" ]; then return; fi
  echo "::error::PROMOTION_TOKEN is not set. Add a repository secret holding a token of a person or an app that can open and merge pull requests."
  exit 1
}

fetchBothBranches() {
  git fetch --quiet origin "$STAGING" "$DEFAULT"
}

holdTheSameFiles() {
  git diff --quiet "origin/$STAGING" "origin/$DEFAULT"
}

openPullRequestNumber() {
  gh pr list --base "$1" --head "$2" --state open --json number --jq '.[0].number'
}

commitsListed() {
  git log --first-parent --format='- %s' -n "$LISTED_COMMITS" "origin/$1..origin/$2"
}

promotionBody() {
  echo "Promotes \`$STAGING\` into \`$DEFAULT\`, opened by the promote-staging workflow at the project's deploy time. It merges itself once its checks pass, and that merge is the deploy."
  echo
  commitsListed "$DEFAULT" "$STAGING"
}

levellingBody() {
  echo "Brings \`$STAGING\` level with \`$DEFAULT\` after a promotion: \`$DEFAULT\` holds changes \`$STAGING\` lacks, such as an urgent fix merged straight into it. Opened by the promote-staging workflow; it merges itself once its checks pass, and a merge into \`$STAGING\` deploys nothing."
  echo
  commitsListed "$STAGING" "$DEFAULT"
}

openOrReusePullRequest() {
  local base="$1" head="$2" title="$3" body="$4"
  local number; number="$(openPullRequestNumber "$base" "$head")"
  if [ -n "$number" ]; then echo "Pull request #$number is already open from $head into $base." >&2; echo "$number"; return; fi
  local url; url="$(gh pr create --base "$base" --head "$head" --title "$title" --body "$body")"
  number="${url##*/}"
  echo "Opened pull request #$number: $title." >&2
  echo "$number"
}

mergeabilityOf() {
  gh pr view "$1" --json mergeable --jq '.mergeable'
}

settledMergeability() {
  local number="$1" look mergeability
  for ((look = 1; look <= MERGEABILITY_LOOKS; look++)); do
    mergeability="$(mergeabilityOf "$number")"
    if [ "$mergeability" = "$MERGEABLE" ] || [ "$mergeability" = "$CONFLICTING" ]; then break; fi
    if [ "$look" -lt "$MERGEABILITY_LOOKS" ]; then sleep "$SECONDS_BETWEEN_LOOKS"; fi
  done
  echo "$mergeability"
}

clashingFiles() {
  git merge-tree --write-tree --name-only --no-messages "origin/$1" "origin/$2" 2>/dev/null \
    | awk 'NR > 1 { printf "%s%s", separator, $0; separator = ", " }' || true
}

stopOnConflict() {
  local number="$1" base="$2" head="$3"
  local mergeability; mergeability="$(settledMergeability "$number")"
  if [ "$mergeability" = "$MERGEABLE" ]; then return; fi
  if [ "$mergeability" != "$CONFLICTING" ]; then echo "GitHub had not yet said whether pull request #$number can be merged."; return; fi
  local files; files="$(clashingFiles "$base" "$head")"
  echo "::error::Pull request #$number cannot merge: $head conflicts with $base${files:+ in $files}. Neither branch can be merged into the other, so nothing deploys until it is put right."
  echo "::error::Put it right: merge $DEFAULT into a branch cut from fresh $STAGING, settle the clashes there, regenerate any generated files, keep $STAGING's copies of the audit's reading files (tools/refactor/audit-output), and send the branch into $STAGING as a pull request merged with a merge commit, never a squash."
  exit 1
}

mergeAtGreen() {
  if gh pr merge --auto --merge "$1"; then echo "Pull request #$1 merges itself once its checks pass."; return; fi
  echo "::error::Auto-merge is not allowed on this repository: tick 'Allow auto-merge' in its settings, or merge pull request #$1 by hand at green."
  exit 1
}

promote() {
  requireToken
  fetchBothBranches
  if holdTheSameFiles; then echo "Nothing to promote: $DEFAULT already holds every file on $STAGING."; return; fi
  local number; number="$(openOrReusePullRequest "$DEFAULT" "$STAGING" "DEPLOY: $STAGING to $DEFAULT, $TODAY" "$(promotionBody)")"
  stopOnConflict "$number" "$DEFAULT" "$STAGING"
  mergeAtGreen "$number"
}

fastForwardStaging() {
  git push --quiet origin "origin/$DEFAULT:refs/heads/$STAGING" 2>/dev/null
}

level() {
  fetchBothBranches
  if holdTheSameFiles; then echo "$STAGING holds every file on $DEFAULT; nothing to level."; return; fi
  if fastForwardStaging; then echo "Fast-forwarded $STAGING to $DEFAULT."; return; fi
  requireToken
  local number; number="$(openOrReusePullRequest "$STAGING" "$DEFAULT" "LEVEL: $DEFAULT into $STAGING, $TODAY" "$(levellingBody)")"
  stopOnConflict "$number" "$STAGING" "$DEFAULT"
  mergeAtGreen "$number"
}

"$MOVE"
