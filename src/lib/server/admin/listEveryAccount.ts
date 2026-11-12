import type { SupabaseClient } from '@supabase/supabase-js';
import { accountOnRegisterColumns, parseAccountOnRegister, type AccountOnRegister } from './accountOnRegister';

/** Every account, newest first, read as the service; the admin page reads the same through admin_list_users as the signed-in admin. */
export async function listEveryAccount(supabase: SupabaseClient): Promise<AccountOnRegister[]> {
	const { data, error } = await supabase
		.from('profiles')
		.select(accountOnRegisterColumns)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data.map(parseAccountOnRegister);
}
