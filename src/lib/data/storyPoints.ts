export const fibonacciStoryPoints = [1, 2, 3, 5, 8, 13, 21] as const;

export const defaultStoryPoints = 2;

export function parseStoryPoints(value: unknown): number {
	const points = Number(value);
	if (fibonacciStoryPoints.includes(points as (typeof fibonacciStoryPoints)[number])) {
		return points;
	}
	return defaultStoryPoints;
}

export const storyPointsRefusal = `Story points are one of ${fibonacciStoryPoints.join(', ')}.`;

/** The story points as given, or null when they are not one of the Fibonacci sizes — never quietly defaulted. */
export function readExactStoryPoints(value: unknown): number | null {
	const points = Number(value);
	const sizes: readonly number[] = fibonacciStoryPoints;
	return sizes.includes(points) ? points : null;
}
