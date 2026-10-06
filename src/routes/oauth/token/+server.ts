import { json } from '@sveltejs/kit';
import { authenticateOauthClient } from '$lib/server/oauth/authenticateOauthClient';
import { exchangeAuthorizationCode } from '$lib/server/oauth/exchangeAuthorizationCode';
import { readTokenRequest, type TokenRequest } from '$lib/server/oauth/readTokenRequest';
import { refreshAccessToken } from '$lib/server/oauth/refreshAccessToken';
import { supportedScope } from '$lib/server/oauth/oauthSettings';
import { oauthErrors } from '$lib/server/oauth/oauthErrors';
import type { IssuedTokens } from '$lib/server/oauth/oauthTokens';
import type { RequestHandler } from './$types';

const badRequest = 400;
const unauthorised = 401;
const neverCache = { 'cache-control': 'no-store', pragma: 'no-cache' };

type Grant = (tokenRequest: TokenRequest) => Promise<IssuedTokens | 'invalid_grant'>;

const grants: Record<string, Grant> = {
	authorization_code: (tokenRequest) =>
		exchangeAuthorizationCode(
			tokenRequest.code,
			tokenRequest.clientId,
			tokenRequest.redirectUri,
			tokenRequest.codeVerifier
		),
	refresh_token: (tokenRequest) =>
		refreshAccessToken(tokenRequest.refreshToken, tokenRequest.clientId)
};

export const POST: RequestHandler = async ({ request }) => {
	const tokenRequest = await readTokenRequest(request);
	if (tokenRequest === null) return refusal('invalid_request', badRequest);
	const client = await authenticateOauthClient(tokenRequest.clientId, tokenRequest.clientSecret);
	if (client === oauthErrors.invalidClient) return refusal('invalid_client', unauthorised);
	const grant = grants[tokenRequest.grantType];
	if (grant === undefined) return refusal('unsupported_grant_type', badRequest);
	return answer(await grant(tokenRequest));
};

function answer(outcome: IssuedTokens | 'invalid_grant'): Response {
	if (outcome === oauthErrors.invalidGrant) return refusal('invalid_grant', badRequest);
	return json(
		{
			access_token: outcome.accessToken,
			refresh_token: outcome.refreshToken,
			token_type: 'Bearer',
			expires_in: outcome.expiresIn,
			scope: supportedScope
		},
		{ headers: neverCache }
	);
}

function refusal(error: string, status: number): Response {
	return json({ error }, { status, headers: neverCache });
}
