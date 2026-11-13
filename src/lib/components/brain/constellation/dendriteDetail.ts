const FULL_DETAIL_NEURON_COUNT = 60;
const SPARSEST_DETAIL_SHARE = 0.45;

export function detailShareFor(neuronCount: number): number {
	const share = FULL_DETAIL_NEURON_COUNT / Math.max(1, neuronCount);
	return Math.min(1, Math.max(SPARSEST_DETAIL_SHARE, share));
}
