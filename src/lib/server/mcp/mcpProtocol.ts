export const serverInformation = {
	name: 'your-business-today',
	title: 'Your Business Today',
	version: '1.0.0'
} as const;

const unchangingList = { listChanged: false } as const;

/** What the connector serves: tools to call, pages a host draws, and prompts the person picks. */
export const serverCapabilities = {
	tools: unchangingList,
	resources: unchangingList,
	prompts: unchangingList
} as const;

export const latestProtocolVersion = '2026-07-28';

export const supportedProtocolVersions = [
	latestProtocolVersion,
	'2025-11-25',
	'2025-06-18',
	'2025-03-26'
];

const listCacheLifetimeMilliseconds = 300_000;

export const listCacheHints = {
	ttlMs: listCacheLifetimeMilliseconds,
	cacheScope: 'private'
} as const;

export function negotiateProtocolVersion(requested: unknown): string {
	if (typeof requested !== 'string') return latestProtocolVersion;
	if (supportedProtocolVersions.includes(requested)) return requested;
	return latestProtocolVersion;
}
