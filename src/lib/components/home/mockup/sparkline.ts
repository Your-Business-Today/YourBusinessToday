const viewBoxWidth = 100;
const viewBoxHeight = 40;
const verticalMargin = 2;

export const sparklineViewBox = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;

/** The polyline points for a run of values, spread across the width and scaled to the highest. */
export function sparklinePoints(values: number[]): string {
	const highest = Math.max(...values);
	const stepAcross = viewBoxWidth / (values.length - 1);
	return values
		.map((value, index) => `${(index * stepAcross).toFixed(1)},${heightOf(value, highest).toFixed(1)}`)
		.join(' ');
}

/** The closed shape beneath the line, for the tinted area under it. */
export function sparklineArea(points: string): string {
	return `M0,${viewBoxHeight} L${points} L${viewBoxWidth},${viewBoxHeight} Z`;
}

function heightOf(value: number, highest: number): number {
	const drawableHeight = viewBoxHeight - verticalMargin * 2;
	return viewBoxHeight - verticalMargin - (value / highest) * drawableHeight;
}
