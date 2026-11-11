import type { SubmitFunction } from '@sveltejs/kit';

/** Send the form a field sits in, for a field that saves the moment it changes. */
export function submitOwnForm(event: Event): void {
	const field = event.currentTarget as HTMLInputElement | HTMLSelectElement;
	field.form?.requestSubmit();
}

/** Save without clearing the form, so a field that saves in place keeps showing its value while the page reloads. */
export const saveInPlace: SubmitFunction = () => {
	return async ({ update }) => update({ reset: false });
};
