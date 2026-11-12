/** What the filing tests' stand-in brain holds: the sources named, the pages filed and the slugs already there. */
export const brain = {
	sharedSourceId: '00000000-0000-0000-0000-0000000000a1',
	slugsAlreadyFiled: [] as string[],
	sourcesNamed: [] as Record<string, unknown>[],
	pagesFiled: [] as Record<string, unknown>[]
};

export function resetBrain(): void {
	brain.slugsAlreadyFiled = [];
	brain.sourcesNamed = [];
	brain.pagesFiled = [];
}

export function newSourcesKept(): string[] {
	return brain.sourcesNamed.flatMap((source) => (typeof source.title === 'string' ? [source.title] : []));
}
