import { checkStates, type CommitCheck } from './commitCheck';
import type { MergeDeploy } from './mergeDeploy';

/**
 * The merges, of those not yet live, whose work is now live. A merge is live when every check on its commit has
 * passed there or on a later merge, which deployed it too. A merge that started no checks of its own is live once
 * a later merge is.
 */
export function liveMerges(merges: MergeDeploy[], checks: CommitCheck[]): MergeDeploy[] {
	const latestFirst = [...merges].sort((first, second) => second.mergedAt.localeCompare(first.mergedAt));
	const passedLater = new Set<string>();
	const nowLive: MergeDeploy[] = [];
	let isLaterMergeLive = false;
	for (const merge of latestFirst) {
		const ownChecks = checks.filter((check) => check.commitSha === merge.commitSha);
		const isLive: boolean = merge.liveAt !== null || isNowLive(ownChecks, passedLater, isLaterMergeLive);
		if (isLive && merge.liveAt === null) nowLive.push(merge);
		for (const check of ownChecks) if (check.state === checkStates.passed) passedLater.add(check.checkName);
		isLaterMergeLive = isLaterMergeLive || isLive;
	}
	return nowLive;
}

function isNowLive(ownChecks: CommitCheck[], passedLater: Set<string>, isLaterMergeLive: boolean): boolean {
	if (ownChecks.length === 0) return isLaterMergeLive;
	return ownChecks.every((check) => check.state === checkStates.passed || passedLater.has(check.checkName));
}
