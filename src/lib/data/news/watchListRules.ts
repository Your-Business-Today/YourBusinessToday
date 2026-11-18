/** The kinds of thing an organisation's Business News watches, as the news_watch_list.kind column (0264) accepts them. */
export const watchedKinds = ['sector_code', 'regulator_or_topic', 'word', 'company'] as const;

export type WatchedKind = (typeof watchedKinds)[number];

export const watchedKindLabels: Record<WatchedKind, string> = {
	sector_code: 'Sector code',
	regulator_or_topic: 'Regulator or topic',
	word: 'Word',
	company: 'Company'
};

/** What each kind's value is, said to the person typing it and to the Claude sending it. */
export const watchedValueHints: Record<WatchedKind, string> = {
	sector_code: 'A five figure SIC code such as 43290, or an eight figure CPV code such as 45000000 or 45000000-7.',
	regulator_or_topic: 'A regulator or gov.uk topic, as gov.uk names it, such as health-and-safety-executive.',
	word: 'A word or phrase from the Domain that marks a story as this organisation’s, such as fire door.',
	company: 'A Companies House number of eight letters and figures, such as 01234567 or SC123456.'
};

/** The limits on a watched thing, stated once and mirrored by the checks on migration 0264's columns. */
export const watchListLimits = {
	longestValue: 120,
	longestLabel: 160
} as const;

/** The shapes a value of each kind must have, as the column's checks hold them; a kind not named takes any text. */
export const watchedValuePatterns: Partial<Record<WatchedKind, RegExp>> = {
	sector_code: /^([0-9]{5}|[0-9]{8}(-[0-9])?)$/,
	company: /^[A-Z0-9]{8}$/
};

/** A thing to watch as it is given, checked by validateWatchedThing before anything is written. */
export type WatchedThingGiven = { kind: WatchedKind; value: string; label: string };

/** One thing an organisation watches, as the page and the connector read it. */
export type WatchedThing = WatchedThingGiven & { id: string; addedAt: string };

export function isWatchedKind(candidate: string): candidate is WatchedKind {
	return watchedKinds.some((kind) => kind === candidate);
}
