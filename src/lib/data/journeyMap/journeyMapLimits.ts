/**
 * The longest each value of a product's journey map may be, and how many of each a version may hold. Migration
 * 0211 holds the same limits on its columns; the connector refuses anything over them before writing.
 */
export const journeyMapLimits = {
	routeLength: 300,
	viewNameLength: 120,
	purposeLength: 1000,
	showsLength: 120,
	howLength: 200,
	arrivesByLength: 120,
	keyLength: 80,
	journeyNameLength: 120,
	roleLength: 80,
	storyLength: 500,
	doesLength: 300,
	mostViews: 500,
	mostLinks: 2000,
	mostEntryPoints: 200,
	mostJourneys: 300,
	mostStepsInAJourney: 50
} as const;

/** A journey's key, and a workflow map station's: lower-case words joined by hyphens. */
export const journeyKeyShape = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The commit a version was read from: seven to forty lower-case hexadecimal characters. */
export const commitShape = /^[0-9a-f]{7,40}$/;

/** Every route starts at the root of the site. */
export const routeStart = '/';
