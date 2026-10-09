import { localDestinationOrDefault } from './localDestination';

/**
 * The callback checks the destination again on return; this only decides what
 * rides through the OAuth round trip.
 */
export function callbackUrlFor(origin: string, destination: string | null): string {
	const next = localDestinationOrDefault(destination);
	return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
