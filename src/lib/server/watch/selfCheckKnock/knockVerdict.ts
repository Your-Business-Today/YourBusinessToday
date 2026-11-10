/** What the knock concluded: whether the deploy's self-check passed, and the sentence that says so. */
export type KnockVerdict = { hasPassed: boolean; report: string };

export function passedVerdict(report: string): KnockVerdict {
	return { hasPassed: true, report };
}

export function failedVerdict(report: string): KnockVerdict {
	return { hasPassed: false, report };
}
