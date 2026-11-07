export type TimeWindow = { start: number; end: number };

const halfway = 0.5;
const overshoot = 1.70158;

export function clampToUnit(amount: number): number {
	return Math.min(1, Math.max(0, amount));
}

/** How far a value has come from start to end, held to 0 before and 1 after. */
export function progressBetween(value: number, start: number, end: number): number {
	return clampToUnit((value - start) / (end - start));
}

export function mix(from: number, to: number, amount: number): number {
	return from + (to - from) * amount;
}

export function smoothStep(amount: number): number {
	return amount * amount * (3 - 2 * amount);
}

export function easeInCubic(amount: number): number {
	return amount * amount * amount;
}

export function easeOutCubic(amount: number): number {
	return 1 - (1 - amount) ** 3;
}

export function easeInOutCubic(amount: number): number {
	const isFirstHalf = amount < halfway;
	return isFirstHalf ? 4 * amount ** 3 : 1 - (-2 * amount + 2) ** 3 / 2;
}

export function easeOutExpo(amount: number): number {
	return amount >= 1 ? 1 : 1 - 2 ** (-10 * amount);
}

export function easeOutBack(amount: number): number {
	const shifted = amount - 1;
	return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
}

/** Rises over the first fade of a window and falls over its last, so a thing arrives and leaves rather than blinking. */
export function presenceIn(seconds: number, window: TimeWindow, fadeSeconds: number): number {
	const arrival = progressBetween(seconds, window.start, window.start + fadeSeconds);
	const departure = progressBetween(seconds, window.end - fadeSeconds, window.end);
	return smoothStep(arrival) * (1 - smoothStep(departure));
}

/** A beat-locked throb: 1 on the beat, falling away before the next. */
export function beatThrob(beats: number, sharpness: number): number {
	const sinceBeat = beats - Math.floor(beats);
	return Math.exp(-sharpness * sinceBeat);
}
