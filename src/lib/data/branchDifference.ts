/** How the head branch stands against the base: the commits it holds that the base lacks, and the files those commits leave different. */
export type BranchDifference = { aheadBy: number; changedFiles: unknown[] | undefined };

const nothingAhead = 0;
const noFilesChanged = 0;

/** Whether the head branch carries nothing to deploy: no commit ahead, or commits ahead that change no file, such as a levelling merge. */
export function holdsTheSameFiles(difference: BranchDifference): boolean {
	if (difference.aheadBy === nothingAhead) return true;
	const { changedFiles } = difference;
	if (changedFiles === undefined) return false;
	return changedFiles.length === noFilesChanged;
}
