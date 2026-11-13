/** Whether the client has said a station is right: not yet, right, or not right with what is wrong. */
export const stationReviewStates = { notChecked: 'not_checked', right: 'right', notRight: 'not_right' } as const;
export type StationReviewState = (typeof stationReviewStates)[keyof typeof stationReviewStates];

/** The two marks a client can make; not checked is only ever where a station starts. */
export const stationMarkStates = [stationReviewStates.right, stationReviewStates.notRight] as const;
export type StationMarkState = (typeof stationMarkStates)[number];

/** Where a station stands: its latest mark, and the version it was made on when it was carried forward. */
export type StationStanding = { reviewState: StationReviewState; whatIsWrong: string | null; markedOnVersion: number | null };

/** Each station's standing on one version, by station key; a station not listed is not checked yet. */
export type StationStandings = Record<string, StationStanding>;

/** The standings of an organisation's latest Before and After, either empty until it is filed. */
export type MapStandings = { before: StationStandings; after: StationStandings };

export const notCheckedStanding: StationStanding = {
	reviewState: stationReviewStates.notChecked,
	whatIsWrong: null,
	markedOnVersion: null
};

export function standingOf(standings: StationStandings, stationKey: string): StationStanding {
	return standings[stationKey] ?? notCheckedStanding;
}
