import { cubicOut } from 'svelte/easing';
import type { FlyParams } from 'svelte/transition';

type RouteLike = { id: string | null };

const viewEntranceRise = 10;
const viewEntranceMilliseconds = 220;

/**
 * The view a person is on: its route and the records its address names. A query, such as a
 * department tab, or a sheet pushed over the view is not a new view, so neither replaces it.
 */
export function viewKeyOf(route: RouteLike, params: Record<string, string>): string {
	return `${route.id}?${new URLSearchParams(params)}`;
}

/** How a view arrives: a short rise and fade, so a click reads as a replace rather than a page load. */
export const viewEntrance: FlyParams = {
	y: viewEntranceRise,
	duration: viewEntranceMilliseconds,
	easing: cubicOut
};
