import { authorizationSchemes, credentialsForScheme } from '$lib/server/tokens/authorizationHeader';

export type TokenRequest = {
	grantType: string;
	clientId: string;
	clientSecret: string;
	code: string;
	redirectUri: string;
	codeVerifier: string;
	refreshToken: string;
};

type BodyFields = Record<string, string>;

export async function readTokenRequest(request: Request): Promise<TokenRequest | null> {
	const fields = await readBodyFields(request);
	if (fields === null) return null;
	const basicCredentials = readBasicCredentials(request);
	return {
		grantType: fields.grant_type ?? '',
		clientId: basicCredentials?.clientId ?? fields.client_id ?? '',
		clientSecret: basicCredentials?.clientSecret ?? fields.client_secret ?? '',
		code: fields.code ?? '',
		redirectUri: fields.redirect_uri ?? '',
		codeVerifier: fields.code_verifier ?? '',
		refreshToken: fields.refresh_token ?? ''
	};
}

async function readBodyFields(request: Request): Promise<BodyFields | null> {
	const contentType = request.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) return readJsonFields(request);
	if (contentType.includes('application/x-www-form-urlencoded')) return readFormFields(request);
	return null;
}

async function readJsonFields(request: Request): Promise<BodyFields | null> {
	const payload = await request.json().catch(() => null);
	if (typeof payload !== 'object' || payload === null) return null;
	return Object.fromEntries(
		Object.entries(payload as Record<string, unknown>).map(([field, value]) => [field, String(value)])
	);
}

async function readFormFields(request: Request): Promise<BodyFields | null> {
	const parameters = new URLSearchParams(await request.text());
	return Object.fromEntries(parameters.entries());
}

function readBasicCredentials(request: Request): { clientId: string; clientSecret: string } | null {
	const encoded = credentialsForScheme(request, authorizationSchemes.basic);
	if (encoded === null) return null;
	const decoded = Buffer.from(encoded, 'base64').toString('utf8');
	const separator = decoded.indexOf(':');
	if (separator === -1) return null;
	return {
		clientId: decodeURIComponent(decoded.slice(0, separator)),
		clientSecret: decodeURIComponent(decoded.slice(separator + 1))
	};
}
