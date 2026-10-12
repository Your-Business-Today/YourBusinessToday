import { sweepFoodHygiene } from '$lib/server/foodHygiene/sweepFoodHygiene';
import type { WatchSource } from './watchSource';

export const foodHygieneSourceName = 'food_hygiene';

/** Every food business in the patches from the Food Standards Agency, nightly, with the feed told what opened, closed or changed hands. */
export const foodHygieneSource: WatchSource = {
	name: foodHygieneSourceName,
	summary: 'loads every food business in the patches from the Food Standards Agency and tells the feed what changed',
	run: sweepFoodHygiene
};
