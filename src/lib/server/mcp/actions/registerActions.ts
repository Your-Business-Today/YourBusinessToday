import { geocodeRegisterPostcodes } from '$lib/server/register/geocodeRegisterPostcodes';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';

export const registerActions: McpAction[] = [
	{
		name: 'geocode_register_postcodes',
		area: 'patches',
		audience: 'admin',
		isWrite: true,
		summary: 'geocode one page of register postcodes the patches have not located yet, and say how many remain',
		guidance: 'Call it again until it answers that nothing remains; each call looks up one page through postcodes.io.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const progress = await geocodeRegisterPostcodes(caller.supabase);
			if (progress.remainingCount === 0) return `${progress.geocodedCount} geocoded; every register postcode in the patches is now located.`;
			return `${progress.geocodedCount} geocoded; ${progress.remainingCount} register postcodes still to geocode — call again.`;
		}
	}
];
