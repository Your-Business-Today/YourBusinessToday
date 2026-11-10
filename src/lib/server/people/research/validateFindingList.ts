/** How one finding in a list is checked: the finding as stored, or a sentence naming what does not fit. */
export type FindingCheck<Finding> = (entry: unknown) => Finding | string;

/** A list of findings as given, each entry checked, or a sentence naming the entry that does not fit; nothing sent reads as none. */
export function validateFindingList<Finding>(
	value: unknown,
	most: number,
	listRefusal: string,
	checkEntry: FindingCheck<Finding>
): Finding[] | string {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value) || value.length > most) return listRefusal;
	const findings: Finding[] = [];
	for (const [index, entry] of value.entries()) {
		const finding = checkEntry(entry);
		if (typeof finding === 'string') return `Entry ${index + 1} of the list: ${finding}`;
		findings.push(finding);
	}
	return findings;
}
