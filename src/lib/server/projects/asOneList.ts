/** What the weave reads off a project its person owns: how many of the projects others own sit above it in their list. */
type PlacedAmongTeamProjects = { teamProjectsAbove: number };

/**
 * A person's own projects and the ones others own, woven into their one list.
 * Both arrive in their board's order and keep it: each own project sits below
 * as many team projects as its count says, never above an own project that
 * comes before it, and the team projects left over go last.
 */
export function asOneList<OwnProject extends PlacedAmongTeamProjects, TeamProject>(
	ownProjects: OwnProject[],
	teamProjects: TeamProject[]
): (OwnProject | TeamProject)[] {
	const list: (OwnProject | TeamProject)[] = [];
	let teamProjectsListed = 0;
	for (const ownProject of ownProjects) {
		const teamProjectsAbove = countWithin(ownProject.teamProjectsAbove, teamProjectsListed, teamProjects.length);
		list.push(...teamProjects.slice(teamProjectsListed, teamProjectsAbove), ownProject);
		teamProjectsListed = teamProjectsAbove;
	}
	return [...list, ...teamProjects.slice(teamProjectsListed)];
}

function countWithin(count: number, fewest: number, most: number): number {
	return Math.min(Math.max(count, fewest), most);
}
