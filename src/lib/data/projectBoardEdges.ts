/** Whether a row is the top or the bottom of its own board among the shown rows. */
export type BoardEdges = { isFirst: boolean; isLast: boolean };

type ProjectOnBoard = { id: string; isYours: boolean };

/** Projects you own and projects others own are listed together but ordered apart, so each has its own top and bottom. */
export function boardEdgesOf(project: ProjectOnBoard, shownProjects: ProjectOnBoard[]): BoardEdges {
	const sameBoardIds = shownProjects
		.filter((shownProject) => shownProject.isYours === project.isYours)
		.map((shownProject) => shownProject.id);
	return {
		isFirst: sameBoardIds[0] === project.id,
		isLast: sameBoardIds.at(-1) === project.id
	};
}
