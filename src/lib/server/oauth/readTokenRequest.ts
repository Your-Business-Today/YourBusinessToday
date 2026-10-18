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

type BasicCredentials = { clientId: string; clientSecret: string };

const malformedCredentials = 'malformed';

const tokenRequestFields = [
	'grant_type',
	'client_id',
	'client_secret',
	'code',
	'redirect_uri',
	'code_verifier',
	'refresh_token'
];

export async function readTokenRequest(request: Request): Promise<TokenRequest | null> {
	const fields = await readBodyFields(request);
	if (fields === null) return null;
	const basicCredentials = readBasicCredentials(request);
	if (basicCredentials === malformedCredentials) return null;
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
	const fields = payload as Record<string, unknown>;
	const isEveryFieldText = tokenRequestFields.every((field) => isTextOrAbsent(fields[field]));
	if (!isEveryFieldText) return null;
	return fields as BodyFields;
}

function isTextOrAbsent(value: unknown): boolean {
	return value === undefined || typeof value === 'string';
}

async function readFormFields(request: Request): Promise<BodyFields | null> {
	const parameters = new URLSearchParams(await request.text());
	return Object.fromEntries(parameters.entries());
}

/** Basic credentials that cannot be decoded are refused, never passed over for the body's. */
function readBasicCredentials(request: Request): BasicCredentials | typeof malformedCredentials | null {
	const encoded = credentialsForScheme(request, authorizationSchemes.basic);
	if (encoded === null) return null;
	const decoded = Buffer.from(encoded, 'base64').toString('utf8');
	const separator = decoded.indexOf(':');
	if (separator === -1) return malformedCredentials;
	const clientId = decodeCredential(decoded.slice(0, separator));
	const clientSecret = decodeCredential(decoded.slice(separator + 1));
	if (clientId === null || clientSecret === null) return malformedCredentials;
	return { clientId, clientSecret };
}

function decodeCredential(encoded: string): string | null {
	try {
		return decodeURIComponent(encoded);
	} catch {
		return null;
	}
}
