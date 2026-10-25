import { formatBritishDateTime } from './britishDate';
import { deployWindowOutcomes, isManualDeploy, type DeployWindow, type DeployWindowHistory } from './deployWindow';
import { stagingBranch } from './stagingBranch';
import type { DeployTime } from './deployTime';
import type { UkClock } from './ukClock';

export type DeployWindowFact = { label: string; href?: string };

type WindowedProject = { deployStagingAt: DeployTime; defaultBranch: string };

const failedMark = '✗';

/**
 * The project header's facts: when the next timed window is, for a project with a deploy time, and what the last
 * promotion did, by the window or by hand.
 */
export function deployWindowFacts(project: WindowedProject, history: DeployWindowHistory, clock: UkClock): DeployWindowFact[] {
	const facts = [nextWindowFact(project.deployStagingAt, history.lastTimed, clock), lastRunFact(history.latest, project.defaultBranch)];
	return facts.filter((fact) => fact !== null);
}

/** The same facts as one sentence for the connector's read_project, or '' when there is nothing to say. */
export function describeDeployWindow(project: WindowedProject, history: DeployWindowHistory, clock: UkClock): string {
	const facts = deployWindowFacts(project, history, clock);
	if (facts.length === 0) return '';
	const clauses = facts.map((fact) => (fact.href === undefined ? fact.label : `${fact.label} (${fact.href})`));
	return `Deploy window: ${clauses.join('; ')}.`;
}

function nextWindowFact(deployTime: DeployTime, lastTimed: DeployWindow | null, clock: UkClock): DeployWindowFact | null {
	if (deployTime === null) return null;
	const isTodayDone = lastTimed?.windowDate === clock.date && lastTimed.outcome !== deployWindowOutcomes.failed;
	const day = isTodayDone ? 'tomorrow' : 'today';
	return { label: `${stagingBranch} deploys ${day} at ${deployTime}` };
}

function lastRunFact(lastRun: DeployWindow | null, defaultBranch: string): DeployWindowFact | null {
	if (lastRun === null) return null;
	const when = formatBritishDateTime(lastRun.ranAt);
	const byHand = isManualDeploy(lastRun) ? ' by hand' : '';
	if (lastRun.outcome === deployWindowOutcomes.failed) return { label: `${failedMark} deploy${byHand} ${when}: ${lastRun.note}` };
	if (lastRun.outcome === deployWindowOutcomes.nothingToPromote) return { label: `nothing to promote${byHand} ${when}` };
	return { label: `${stagingBranch} sent to ${defaultBranch}${byHand} ${when}`, href: lastRun.pullRequestUrl };
}
