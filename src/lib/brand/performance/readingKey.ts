import type { PerformanceReading } from './performanceReading';

type ReadingSubject = Pick<PerformanceReading, 'contentPieceId' | 'campaignId' | 'mediumPath' | 'observedOn'>;

/** What makes a reading the one of its day: the piece, the campaign, the medium and the day it is for. */
export function readingKey(reading: ReadingSubject): string {
	return [reading.contentPieceId ?? '', reading.campaignId ?? '', reading.mediumPath, reading.observedOn].join('|');
}
