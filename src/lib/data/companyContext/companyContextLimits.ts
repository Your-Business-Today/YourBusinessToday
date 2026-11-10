/**
 * The longest each value of a company context may be, and how many of each a version may hold. Migration
 * 0151 holds the same limits on its columns; the connector refuses anything over them before writing.
 */
export const companyContextLimits = {
	keyLength: 80,
	nameLength: 120,
	descriptionLength: 1000,
	connectorLength: 80,
	placeLength: 300,
	whatIsWrongLength: 1000,
	stepLength: 300,
	mostConnectors: 50,
	mostParts: 300,
	mostStepsInAProcess: 50,
	mostLinks: 1000
} as const;

/** A part's key: lower-case words joined by hyphens, kept the same from one version to the next. */
export const partKeyShape = /^[a-z0-9]+(-[a-z0-9]+)*$/;
