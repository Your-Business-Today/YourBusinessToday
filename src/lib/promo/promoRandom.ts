export type RandomSource = () => number;

const mulberryIncrement = 0x6d2b79f5;
const mulberryShiftA = 15;
const mulberryShiftB = 7;
const mulberryShiftC = 14;
const unsignedRange = 4294967296;

/** The same seed gives the same numbers on every render, so every frame of the film is repeatable. */
export function seededRandom(seed: number): RandomSource {
	let state = seed >>> 0;
	return () => {
		state = (state + mulberryIncrement) >>> 0;
		let mixed = Math.imul(state ^ (state >>> mulberryShiftA), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> mulberryShiftB), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> mulberryShiftC)) >>> 0) / unsignedRange;
	};
}

export function randomBetween(random: RandomSource, minimum: number, maximum: number): number {
	return minimum + (maximum - minimum) * random();
}

export function randomSigned(random: RandomSource, magnitude: number): number {
	return randomBetween(random, -magnitude, magnitude);
}
