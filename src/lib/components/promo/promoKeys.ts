import { chapterAt, promoChapters, promoDurationSeconds } from '$lib/promo/promoTimeline';

export type PromoKeyActions = { toggle: () => void; seek: (seconds: number) => void; toggleSound: () => void };

const restartWindowSeconds = 1.5;

function nextChapterStart(seconds: number): number {
	const index = promoChapters.indexOf(chapterAt(seconds));
	const next = promoChapters[index + 1];
	return next ? next.startSeconds : promoDurationSeconds;
}

function previousChapterStart(seconds: number): number {
	const current = chapterAt(seconds);
	const index = promoChapters.indexOf(current);
	const isJustStarted = seconds - current.startSeconds < restartWindowSeconds;
	const previous = promoChapters[Math.max(0, index - 1)];
	return isJustStarted ? previous.startSeconds : current.startSeconds;
}

/** The player's keys: space or K plays and pauses, the arrows step between chapters and M turns the sound on or off. */
export function keyActionFor(key: string, seconds: number, actions: PromoKeyActions): (() => void) | undefined {
	const keyActions: Record<string, () => void> = {
		' ': actions.toggle,
		k: actions.toggle,
		m: actions.toggleSound,
		ArrowRight: () => actions.seek(nextChapterStart(seconds)),
		ArrowLeft: () => actions.seek(previousChapterStart(seconds))
	};
	return keyActions[key];
}
