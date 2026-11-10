import { PostingRhythmKeys, type PostingRhythm } from '$lib/brand/rhythm/postingRhythm';
import type { RhythmTally } from '$lib/brand/plan/planRhythm';

const noneExtra = 0;

/** The brand's posting rhythms as a Claude reads them before it plans the month, or how to record one where there is none. */
export function describePostingRhythms(rhythms: PostingRhythm[]): string {
	if (rhythms.length === 0) {
		const { days, time, postsAWeek } = PostingRhythmKeys;
		return (
			`No posting rhythm is in the kit yet: record ${days}, ${time} and ${postsAWeek} with record_brand_decisions, ` +
			'everywhere or on a channel for that channel’s own number.'
		);
	}
	return (
		`Posting rhythm: ${rhythms.map(rhythmLine).join('; ')}. A post counts towards the rhythm decided nearest its medium. ` +
		'Plan new posts on the posting days at the posting time; a post on another day is kept and shown as extra.'
	);
}

/** One rhythm's week: its count against the number due, how short it is, and what was planned outside it. */
export function describeTally({ medium, count, due, extra, isShort }: RhythmTally): string {
	const shortBy = isShort ? `, short by ${due - count}` : '';
	const outside = extra === noneExtra ? '' : `, ${extra} extra`;
	return `${medium} ${count} of ${due} due${shortBy}${outside}`;
}

function rhythmLine({ medium, days, time, postsAWeek }: PostingRhythm): string {
	const onDays = days === null ? '' : ` on ${days.join(', ')}`;
	const atTime = time === null ? '' : ` at ${time}`;
	return `${medium} — ${postsAWeek} a week${onDays}${atTime}`;
}
