#!/usr/bin/env bash
# Installed by the project-process kit (re-run its bootstrap to refresh; do not edit by hand).
# Promotes the staging branch into the default branch as one pull request that merges itself at
# green: opens it when staging is ahead and none is open, reuses the open one otherwise, and turns
# auto-merge on. Nothing to promote is a quiet success. Needs the GitHub CLI signed in as a person
# or an app (GH_TOKEN), never the Actions token, so the pull request runs its checks and its merge deploys.
#
#   scripts/promote-staging.sh [staging branch] [default branch]
set -euo pipefail

STAGING="${1:-staging}"
DEFAULT="${2:-main}"
TITLE="DEPLOY: $STAGING to $DEFAULT, $(date -u +%Y-%m-%d)"
LISTED_COMMITS=50

requireToken() {
  if [ -n "${GH_TOKEN:-}" ]; then return; fi
  echo "::error::PROMOTION_TOKEN is not set. Add a repository secret holding a token of a person or an app that can open and merge pull requests."
  exit 1
}

fetchBothBranches() {
  git fetch --quiet origin "$STAGING" "$DEFAULT"
}

commitsToPromote() {
  git rev-list --count "origin/$DEFAULT..origin/$STAGING"
}

openPullRequestNumber() {
  gh pr list --base "$DEFAULT" --head "$STAGING" --state open --json number --jq '.[0].number'
}

promotionBody() {
  echo "Promotes $1 commit(s) from \`$STAGING\` to \`$DEFAULT\`, opened by the promote-staging workflow at the project's deploy time. It merges itself once its checks pass, and that merge is the deploy."
  echo
  git log --first-parent --format='- %s' -n "$LISTED_COMMITS" "origin/$DEFAULT..origin/$STAGING"
}

createPullRequest() {
  local url; url="$(gh pr create --base "$DEFAULT" --head "$STAGING" --title "$TITLE" --body "$(promotionBody "$1")")"
  echo "${url##*/}"
}

mergeAtGreen() {
  if gh pr merge --auto --merge "$1"; then echo "Pull request #$1 merges itself once its checks pass."; return; fi
  echo "::error::Auto-merge is not allowed on this repository: tick 'Allow auto-merge' in its settings, or merge pull request #$1 by hand at green."
  exit 1
}

main() {
  requireToken
  fetchBothBranches
  local count; count="$(commitsToPromote)"
  if [ "$count" = "0" ]; then echo "Nothing to promote: $DEFAULT already holds everything on $STAGING."; return; fi
  local number; number="$(openPullRequestNumber)"
  if [ -n "$number" ]; then echo "Pull request #$number is already open from $STAGING into $DEFAULT."; else number="$(createPullRequest "$count")"; echo "Opened pull request #$number: $TITLE ($count commits)."; fi
  mergeAtGreen "$number"
}

main
