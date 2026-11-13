import { journeyMapLimits as limits, journeyKeyShape, routeStart } from '$lib/data/journeyMap/journeyMapLimits';
import { isRefused, readOptionalText, readRequiredText } from '$lib/server/companyContext/contextText';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** A view's route: text that starts at the root of the site, such as /projects/{projectId}. */
export function readRoute(value: unknown, field: string): string | Refusal {
	const route = readRequiredText(value, { field, limit: limits.routeLength });
	if (isRefused(route)) return route;
	if (route.startsWith(routeStart)) return route;
	return { refusal: `${field} must be a route that starts with /, such as /projects/{projectId}.` };
}

/** A route that names a view of the version being filed, so nothing points at a view the version does not hold. */
export function readRouteOfView(value: unknown, field: string, routes: Set<string>): string | Refusal {
	const route = readRoute(value, field);
	if (isRefused(route)) return route;
	if (routes.has(route)) return route;
	return { refusal: `${field} "${route}" is not the route of a view in this version.` };
}

/** A key: lower-case words joined by hyphens. */
export function readKey(value: unknown, field: string): string | Refusal {
	const key = readRequiredText(value, { field, limit: limits.keyLength });
	if (isRefused(key)) return key;
	return keyOfShape(key, field);
}

/** A key that may be left out, such as the workflow map station a journey carries out. */
export function readOptionalKey(value: unknown, field: string): string | null | Refusal {
	const key = readOptionalText(value, { field, limit: limits.keyLength });
	if (key === null || isRefused(key)) return key;
	return keyOfShape(key, field);
}

function keyOfShape(key: string, field: string): string | Refusal {
	if (journeyKeyShape.test(key)) return key;
	return { refusal: `${field} must be lower-case words joined by hyphens, such as raise-an-invoice.` };
}
