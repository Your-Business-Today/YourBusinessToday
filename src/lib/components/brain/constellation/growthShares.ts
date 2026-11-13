const FLARE_OVERSHOOT = 1.7;

export function clampShare(share: number): number {
	return Math.min(1, Math.max(0, share));
}

export function flare(share: number): number {
	const shifted = share - 1;
	return 1 + (FLARE_OVERSHOOT + 1) * shifted ** 3 + FLARE_OVERSHOOT * shifted ** 2;
}
