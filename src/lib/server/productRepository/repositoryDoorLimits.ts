/**
 * What one call through the doors onto a product's repository takes and gives back: the longest path it reads, the
 * most entries of a folder it lists and the most characters of a file it returns.
 */
export const repositoryDoorLimits = {
	pathLength: 400,
	mostFolderEntries: 500,
	mostFileCharacters: 100_000
} as const;
