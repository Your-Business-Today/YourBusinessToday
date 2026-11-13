const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;
const UNIT_RESOLUTION = 100000;
const STREAM_MULTIPLIER = 9301.7;
const STREAM_INCREMENT = 0.2331;

export function pseudoRandomFrom(seed: string): number {
	let hash = FNV_OFFSET_BASIS;
	for (const character of seed) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, FNV_PRIME);
	}
	return ((hash >>> 0) % UNIT_RESOLUTION) / UNIT_RESOLUTION;
}

export function shareStreamFrom(seedText: string): () => number {
	let seed = pseudoRandomFrom(seedText);
	return () => {
		seed = (seed * STREAM_MULTIPLIER + STREAM_INCREMENT) % 1;
		return seed;
	};
}
