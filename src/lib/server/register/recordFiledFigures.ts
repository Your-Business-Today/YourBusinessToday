import type { SupabaseClient } from '@supabase/supabase-js';
import { validateFiledFigures, type FiledFigures } from '$lib/data/filedFigures';

/** The figures go on the register row once they are checked against their columns; a misread is refused with its reason. */
export async function recordFiledFigures(supabase: SupabaseClient, companyNumber: string, figures: FiledFigures): Promise<string | null> {
	const refusal = validateFiledFigures(figures);
	if (refusal !== null) return refusal;
	const { error } = await supabase
		.from('register_companies')
		.update({
			net_assets: figures.netAssets,
			cash: figures.cash,
			creditors: figures.creditors,
			average_employees: figures.averageEmployees,
			figures_made_up_to: figures.madeUpTo,
			figures_source_url: figures.sourceUrl
		})
		.eq('company_number', companyNumber);
	if (error) throw error;
	return null;
}
