export function reorderListOf(row: HTMLElement): string | undefined {
	const { dataset } = row;
	return dataset.reorderList;
}

export function reorderRowOf(row: HTMLElement): string | undefined {
	const { dataset } = row;
	return dataset.reorderRow;
}

export function reorderGroupOf(row: HTMLElement): string | undefined {
	const { dataset } = row;
	return dataset.reorderGroup;
}
