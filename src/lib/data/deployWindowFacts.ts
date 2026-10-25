import { formatBritishDateTime } from './britishDate';
import { deployWindowOutcomes, type DeployWindow } from './deployWindow';
import { stagingBranch } from './stagingBranch';
import type { DeployTime } from './deployTime';
import type { UkClock } from './ukClock';

export type DeployWindowFact = { label: string; href?: string };

type WindowedProject = { deployStagingAt: DeployTime; defaultBranch: string };

const failedMark = '✗';

/** The project header's two facts: when the next window is, and what the last one did; nothing without a deploy time. */
export function deployWindowFacts(project: WindowedProject, lastWindow: DeployWindow | null, clock: UkClock): DeployWindowFact[] {
	if (project.deployStagingAt === null) return [];
	const facts = [nextWindowFact(project.deployStagingAt, lastWindow, clock), lastWindowFact(lastWindow, project.defaultBranch)];
	return facts.filter((fact) => fact !== null);
}

/** The same facts as one sentence for the connector's read_project, or '' without a deploy time. */
export function describeDeployWindow(project: WindowedProject, lastWindow: DeployWindow | null, clock: UkClock): string {
	const facts = deployWindowFacts(project, lastWindow, clock);
	if (facts.length === 0) return '';
	const clauses = facts.map((fact) => (fact.href === undefined ? fact.label : `${fact.label} (${fact.href})`));
	return `Deploy window: ${clauses.join('; ')}.`;
}

function nextWindowFact(deployTime: string, lastWindow: DeployWindow | null, clock: UkClock): DeployWindowFact {
	const isTodayDone = lastWindow?.windowDate === clock.date && lastWindow.outcome !== deployWindowOutcomes.failed;
	const day = isTodayDone ? 'tomorrow' : 'today';
	return { label: `${stagingBranch} deploys ${day} at ${deployTime}` };
}

function lastWindowFact(lastWindow: DeployWindow | null, defaultBranch: string): DeployWindowFact | null {
	if (lastWindow === null) return null;
	const when = formatBritishDateTime(lastWindow.ranAt);
	if (lastWindow.outcome === deployWindowOutcomes.failed) return { label: `${failedMark} deploy window ${when}: ${lastWindow.note}` };
	if (lastWindow.outcome === deployWindowOutcomes.nothingToPromote) return { label: `nothing to promote ${when}` };
	return { label: `${stagingBranch} sent to ${defaultBranch} ${when}`, href: lastWindow.pullRequestUrl };
}
