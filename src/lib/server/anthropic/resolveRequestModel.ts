import { getSiteModel } from './getSiteModel';
import { requestModelOverride } from './modelContext';

/**
 * The model a signed-in user's own questions run on: admin pin, then their
 * slider choice (both via the request resolver), then the site default.
 */
export async function resolveRequestModel(): Promise<string> {
	return (await requestModelOverride()) ?? (await getSiteModel());
}
