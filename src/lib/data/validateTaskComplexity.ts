import { complexityCountLimits, type TaskComplexity } from './taskComplexity';

export type ComplexityFields = {
	viewsChanged: unknown;
	newViews: unknown;
	changesDataStructure: unknown;
	domainObjects: unknown;
};

const countNames = { viewsChanged: 'views changed', newViews: 'new views', domainObjects: 'domain objects' };

/** The four measures as given, or why they are refused: whole counts within their columns, never rounded. */
export function validateTaskComplexity(fields: ComplexityFields): TaskComplexity | string {
	const counts = Object.keys(countNames) as (keyof typeof countNames)[];
	const badCount = counts.find((field) => !isCount(fields[field]));
	if (badCount !== undefined) return countRefusal(countNames[badCount]);
	if (typeof fields.changesDataStructure !== 'boolean') return 'changesDataStructure is true or false.';
	return {
		viewsChanged: Number(fields.viewsChanged),
		newViews: Number(fields.newViews),
		changesDataStructure: fields.changesDataStructure,
		domainObjects: Number(fields.domainObjects)
	};
}

function isCount(value: unknown): boolean {
	const isWritten = value !== null && value !== undefined && value !== '';
	const count = Number(value);
	if (!isWritten || !Number.isInteger(count)) return false;
	return count >= complexityCountLimits.least && count <= complexityCountLimits.most;
}

function countRefusal(name: string): string {
	return `${name} is a whole number from ${complexityCountLimits.least} to ${complexityCountLimits.most}.`;
}
