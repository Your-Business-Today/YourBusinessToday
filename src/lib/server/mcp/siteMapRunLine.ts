import { readActionToolName } from './actionToolNames';
import { siteMapRequest } from '$lib/data/personRequests';
import { siteMapRunActionName } from './actions/siteMapRunActionNames';

/** For a person on any product: mapping its site as journeys starts with the site map run. */
export function siteMapRunLine(productIds: string[]): string | null {
	if (productIds.length === 0) return null;
	return (
		`To map a product's site as journeys through its views, as "${siteMapRequest}" asks, call ${readActionToolName} ` +
		`with ${siteMapRunActionName} and the projectId of a product you are on, and follow what it answers.`
	);
}
