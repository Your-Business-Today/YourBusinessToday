/** Where the register watch got to: the day it was checking and the last outcode finished for it. */
export type WatchMarker = { day: string; outcode: string };

const separator = '|';

export function formatWatchMarker(marker: WatchMarker): string {
	return `${marker.day}${separator}${marker.outcode}`;
}

export function parseWatchMarker(text: string): WatchMarker | null {
	const [day, outcode] = text.split(separator);
	if (day === undefined || day === '') return null;
	return { day, outcode: outcode ?? '' };
}
