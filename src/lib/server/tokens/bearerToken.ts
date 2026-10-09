import { authorizationSchemes, credentialsForScheme } from './authorizationHeader';

export function bearerToken(request: Request): string {
	return credentialsForScheme(request, authorizationSchemes.bearer) ?? '';
}
