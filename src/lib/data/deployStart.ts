import { deployWindowStarts, type DeployWindowStart } from './deployWindow';

/** What set a promotion going: the timed window, or Deploy now pressed by hand. Nobody is named, since the pull request is public on GitHub. */
export type DeployStart = { startedBy: DeployWindowStart };

export const timedWindowStart: DeployStart = { startedBy: deployWindowStarts.window };

export const deployByHandStart: DeployStart = { startedBy: deployWindowStarts.manual };

export function isStartedByHand(start: DeployStart): boolean {
	return start.startedBy === deployWindowStarts.manual;
}
