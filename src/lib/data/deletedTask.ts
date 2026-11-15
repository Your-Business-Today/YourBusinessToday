/** The field the form that puts a deleted task back names its deletion by. */
export const deletedTaskInputs = { deletionId: 'deletionId' } as const;

/** What the confirmation says comes back, and what does not: the files went from storage with the task. */
export function whatComesBack(title: string, attachedFilenames: string[]): string {
	const attachedFileCount = attachedFilenames.length;
	const comesBack = `This puts “${title}” back on the board with the id it had, its conversation and its history.`;
	if (attachedFileCount === 0) return comesBack;
	const files =
		attachedFileCount === 1
			? 'Its attached file does not come back: it'
			: `Its ${attachedFileCount} attached files do not come back: they`;
	return `${comesBack} ${files} went from storage with the task.`;
}
