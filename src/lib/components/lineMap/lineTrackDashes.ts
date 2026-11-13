import { LineTracks, type LineTrack } from './layout/lineMapModel';

/** How long a dash and a gap are, in strokes: a dot is a dash of no length that the round cap draws. */
const DashLengths = { dash: 1.5, dashGap: 2, dot: 0, dotGap: 2 } as const;

/** The stroke-dasharray that draws a track: none for a solid line, dashes for an outside party, dots for a system. */
export function trackDashesOf(track: LineTrack, stroke: number): string | undefined {
	if (track === LineTracks.dashed) return `${DashLengths.dash * stroke} ${DashLengths.dashGap * stroke}`;
	if (track === LineTracks.dotted) return `${DashLengths.dot * stroke} ${DashLengths.dotGap * stroke}`;
	return undefined;
}
