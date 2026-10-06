import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { supportedCodeChallengeMethod } from './oauthSettings';

export type AuthorizationRequest = {
	clientId: string;
	clientName: string;
	redirectUri: string;
	codeChallenge: string;
	state: string;
};

const authorizationCodeResponseType = 'code';

export async function readAuthorizationRequest(
	parameters: URLSearchParams
): Promise<AuthorizationRequest | null> {
	if (parameters.get('response_type') !== authorizationCodeResponseType) return null;
	if (parameters.get('code_challenge_method') !== supportedCodeChallengeMethod) return null;
	const clientId = parameters.get('client_id') ?? '';
	const redirectUri = parameters.get('redirect_uri') ?? '';
	const codeChallenge = parameters.get('code_challenge') ?? '';
	if (clientId === '' || redirectUri === '' || codeChallenge === '') return null;
	const client = await findOauthClient(clientId);
	if (client === null) return null;
	if (!client.redirectUris.includes(redirectUri)) return null;
	return {
		clientId,
		clientName: client.clientName,
		redirectUri,
		codeChallenge,
		state: parameters.get('state') ?? ''
	};
}

export type OauthClient = {
	clientId: string;
	clientName: string;
	redirectUris: string[];
	clientSecretHash: string | null;
};

export async function findOauthClient(clientId: string): Promise<OauthClient | null> {
	const { data, error } = await supabaseServiceClient()
		.from('oauth_clients')
		.select('client_id, client_name, redirect_uris, client_secret_hash')
		.eq('client_id', clientId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return {
		clientId: data.client_id,
		clientName: data.client_name,
		redirectUris: data.redirect_uris ?? [],
		clientSecretHash: data.client_secret_hash
	};
}
