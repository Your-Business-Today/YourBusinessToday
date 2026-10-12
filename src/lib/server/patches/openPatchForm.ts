import { getPatch } from './getPatch';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

export const noSuchPatchMessage = 'That patch could not be found.';

/** Every patch form action starts by checking the caller is staff and finding the patch the form names. */
export async function openPatchForm({ locals, request }: StaffFormEvent) {
	const user = await requireStaff(locals);
	const formData = await request.formData();
	const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
	return { user, formData, patch };
}
