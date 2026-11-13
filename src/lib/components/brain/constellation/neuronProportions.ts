export type BodyProportions = {
	somaRadius: number;
	glowScale: number;
	hitRadius: number;
	dendriteReach: number;
	dendriteRootRadiusShare: number;
	branchCountFloor: number;
	branchCountCeiling: number;
};

export const neuronProportions: BodyProportions = {
	somaRadius: 0.024,
	glowScale: 0.2,
	hitRadius: 0.32,
	dendriteReach: 0.5,
	dendriteRootRadiusShare: 0.13,
	branchCountFloor: 4,
	branchCountCeiling: 7
};

export const nucleusProportions: BodyProportions = {
	somaRadius: 0.05,
	glowScale: 0.45,
	hitRadius: 0.55,
	dendriteReach: 0.8,
	dendriteRootRadiusShare: 0.085,
	branchCountFloor: 5,
	branchCountCeiling: 8
};
