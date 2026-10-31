type ReadsByName = Record<string, unknown>;

/** Every read started at once and awaited together, each answer kept under the name it was asked for. */
export async function readTogether<Reads extends ReadsByName>(
	reads: Reads
): Promise<{ [Name in keyof Reads]: Awaited<Reads[Name]> }> {
	const names = Object.keys(reads);
	const answers = await Promise.all(Object.values(reads));
	return Object.fromEntries(names.map((name, index) => [name, answers[index]])) as {
		[Name in keyof Reads]: Awaited<Reads[Name]>;
	};
}
