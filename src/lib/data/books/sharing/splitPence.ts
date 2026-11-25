/** Whole pence split into that many parts as evenly as can be, the odd pence going to the first parts, so they add up exactly. */
export function splitPenceEvenly(pence: number, partCount: number): number[] {
	const smallestPart = Math.trunc(pence / partCount);
	const oddPence = pence - smallestPart * partCount;
	return Array.from({ length: partCount }, (_, index) => (index < oddPence ? smallestPart + 1 : smallestPart));
}
