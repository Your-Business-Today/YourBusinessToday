type RouteLike = { id: string | null };

/**
 * The view a person is on: its route and the records its address names. A query, such as a
 * department tab, or a sheet pushed over the view is not a new view, so neither replaces it.
 */
export function viewKeyOf(route: RouteLike, params: Record<string, string>): string {
	return `${route.id}?${new URLSearchParams(params)}`;
}
