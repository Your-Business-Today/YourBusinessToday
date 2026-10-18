import { validateTextColumn } from './textColumnRules';

/**
 * Why oauth_authorization_codes cannot hold the request's values, or null when it can:
 * client_id, redirect_uri and code_challenge are text columns.
 */
export function validateAuthorizationRequest(parameters: URLSearchParams): string | null {
	return (
		validateTextColumn('client_id', parameters.get('client_id') ?? '') ??
		validateTextColumn('redirect_uri', parameters.get('redirect_uri') ?? '') ??
		validateTextColumn('code_challenge', parameters.get('code_challenge') ?? '')
	);
}
