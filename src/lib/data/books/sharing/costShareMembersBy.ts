import type { ProjectStatus } from '$lib/data/projectStatus';

/** How a shared cost finds the projects sharing it: the projects named as members, or every project live that month. */
export const CostShareMembersBy = { named: 'named', liveProjects: 'live_projects' } as const;

export type CostShareMembersByChoice = (typeof CostShareMembersBy)[keyof typeof CostShareMembersBy];

/** The statuses of a project that is live, and so shares a cost kept by rule. */
export const liveProjectStatuses: readonly ProjectStatus[] = ['building', 'testing', 'maintenance'];

const choices: readonly string[] = Object.values(CostShareMembersBy);

/** Why the value is not a way of finding a shared cost's projects, or null when it is one. */
export function membersByRefusal(candidate: unknown): string | null {
	if (typeof candidate === 'string' && choices.includes(candidate)) return null;
	return `membersBy is one of ${choices.join(' or ')}; ${JSON.stringify(candidate)} was given.`;
}
