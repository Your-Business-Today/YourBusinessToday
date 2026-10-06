export type KitStanding = 'no_repository' | 'not_read' | 'no_kit' | 'unknown_latest' | 'current' | 'behind';

export const kitStandings = {
	noRepository: 'no_repository',
	notRead: 'not_read',
	noKit: 'no_kit',
	unknownLatest: 'unknown_latest',
	current: 'current',
	behind: 'behind'
} as const;

export type KitReading = {
	hasRepository: boolean;
	isRead: boolean;
	kitVersion: string;
	latestKitVersion: string;
};

const versionSeparator = '.';

/** Where a repository stands against the latest project-process kit. */
export function kitStanding(reading: KitReading): KitStanding {
	if (!reading.hasRepository) return 'no_repository';
	if (!reading.isRead) return 'not_read';
	if (reading.kitVersion === '') return 'no_kit';
	if (reading.latestKitVersion === '') return 'unknown_latest';
	const isBehind = compareKitVersions(reading.kitVersion, reading.latestKitVersion) < 0;
	return isBehind ? 'behind' : 'current';
}

/** Negative when the first version is older, positive when newer, zero when the same — part by part, as numbers. */
export function compareKitVersions(first: string, second: string): number {
	const firstParts = versionParts(first);
	const secondParts = versionParts(second);
	const partCount = Math.max(firstParts.length, secondParts.length);
	for (let index = 0; index < partCount; index++) {
		const difference = (firstParts[index] ?? 0) - (secondParts[index] ?? 0);
		if (difference !== 0) return difference;
	}
	return 0;
}

function versionParts(version: string): number[] {
	return version
		.trim()
		.replace(/^v/i, '')
		.split(versionSeparator)
		.map((part) => Number.parseInt(part, 10) || 0);
}

export function describeKitStanding(standing: KitStanding, reading: KitReading): string {
	const descriptions: Record<KitStanding, string> = {
		no_repository: 'No repository recorded, so no kit version to read.',
		not_read:
			'The kit version has not been read from this repository yet: the site could not see it. A private repository needs the site’s GITHUB_TOKEN to have access to it; then read the versions again from Projects › Kit versions.',
		no_kit: 'The project-process kit is not installed in this repository.',
		unknown_latest: `On kit ${reading.kitVersion}; the latest kit version has not been read yet.`,
		current: `On kit ${reading.kitVersion}, the latest.`,
		behind: `On kit ${reading.kitVersion}, behind the latest ${reading.latestKitVersion}.`
	};
	return descriptions[standing];
}
