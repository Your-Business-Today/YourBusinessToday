export const yourOwnershipLabel = 'You';

/** Who owns a project on the projects list: "You", or the owner's name. */
export function ownerLabel(project: { isYours: boolean; ownerName: string }): string {
	if (project.isYours) return yourOwnershipLabel;
	return project.ownerName;
}
