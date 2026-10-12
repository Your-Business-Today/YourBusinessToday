import { premisesSources, type PremisesSource } from '$lib/data/foodHygieneRules';

const sourceOrder: PremisesSource[] = [premisesSources.foodHygiene, premisesSources.placesDataset];

export function parsePremisesSource(value: unknown): PremisesSource {
	return sourceOrder.find((source) => source === value) ?? premisesSources.foodHygiene;
}
