import type { TokenRequest } from './readTokenRequest';
import { validateTextColumn } from './textColumnRules';

/**
 * Why oauth_tokens cannot hold the request's values, or null when it can. The client_id is the
 * one value the request writes; the code, verifier and tokens are only hashed or compared.
 */
export function validateTokenRequest(tokenRequest: TokenRequest): string | null {
	return validateTextColumn('client_id', tokenRequest.clientId);
}
