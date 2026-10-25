import { deployWindowStarts, type DeployWindowStart } from './deployWindow';

/** Who set a promotion going: the timed window, or the named person who pressed Deploy now. */
export type DeployStart = { startedBy: DeployWindowStart; personName: string };

export const timedWindowStart: DeployStart = { startedBy: deployWindowStarts.window, personName: '' };

export function deployByHand(personName: string): DeployStart {
	return { startedBy: deployWindowStarts.manual, personName };
}

export function isStartedByHand(start: DeployStart): boolean {
	return start.startedBy === deployWindowStarts.manual;
}
