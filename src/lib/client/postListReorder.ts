import { deserialize } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { actionResultTypes } from './actionResultTypes';

/**
 * Submit a drop-reorder to a page action outside any <form>, then refetch
 * the page data so the list settles into its saved order.
 */
export async function postListReorder(
	action: string,
	fields: Record<string, string>
): Promise<void> {
	const response = await fetch(action, {
		method: 'POST',
		body: toFormData(fields),
		headers: { 'x-sveltekit-action': 'true' }
	});
	const result = deserialize(await response.text());
	if (result.type === actionResultTypes.success) await invalidateAll();
}

function toFormData(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [fieldName, fieldValue] of Object.entries(fields)) {
		formData.append(fieldName, fieldValue);
	}
	return formData;
}
