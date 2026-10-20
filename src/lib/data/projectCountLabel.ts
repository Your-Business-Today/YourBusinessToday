/** "10 projects", or "8 of 10 projects" when the filters hide some. */
export function projectCountLabel(totalCount: number, shownCount: number): string {
	const noun = totalCount === 1 ? 'project' : 'projects';
	if (shownCount === totalCount) return `${totalCount} ${noun}`;
	return `${shownCount} of ${totalCount} ${noun}`;
}
