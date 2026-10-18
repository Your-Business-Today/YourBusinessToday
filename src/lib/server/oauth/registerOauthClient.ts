import { hashSecret, mintSecret } from './oauthTokens';
import {
	needsClientSecret,
	readClientRegistration,
	type ClientRegistrationRequest
} from './readClientRegistration';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type ClientRegistration = {
	client_id: string;
	client_id_issued_at: number;
	client_name: string;
	redirect_uris: string[];
	client_secret?: string;
	client_secret_expires_at?: number;
	token_endpoint_auth_method: string;
	grant_types: string[];
	response_types: string[];
};

const secretNeverExpires = 0;
const millisecondsPerSecond = 1000;

export async function registerOauthClient(
	submission: Record<string, unknown>
): Promise<ClientRegistration> {
	const registration = readClientRegistration(submission);
	const clientId = mintSecret('ybt_client_');
	const clientSecret = needsClientSecret(registration.authenticationMethod)
		? mintSecret('ybt_cs_')
		: null;
	await storeClient(clientId, clientSecret, registration);
	return {
		client_id: clientId,
		client_id_issued_at: Math.floor(Date.now() / millisecondsPerSecond),
		client_name: registration.clientName,
		redirect_uris: registration.redirectUris,
		...secretFields(clientSecret),
		token_endpoint_auth_method: registration.authenticationMethod,
		grant_types: ['authorization_code', 'refresh_token'],
		response_types: ['code']
	};
}

async function storeClient(
	clientId: string,
	clientSecret: string | null,
	registration: ClientRegistrationRequest
): Promise<void> {
	const { error } = await supabaseServiceClient()
		.from('oauth_clients')
		.insert({
			client_id: clientId,
			client_secret_hash: clientSecret === null ? null : hashSecret(clientSecret),
			client_name: registration.clientName,
			redirect_uris: registration.redirectUris
		});
	if (error) throw error;
}

function secretFields(clientSecret: string | null): Partial<ClientRegistration> {
	if (clientSecret === null) return {};
	return { client_secret: clientSecret, client_secret_expires_at: secretNeverExpires };
}
