/** Open a date box's own calendar on a press anywhere on it, not only on the browser's small icon. */
export function openDatePicker(event: MouseEvent): void {
	const field = event.currentTarget as HTMLInputElement;
	if (typeof field.showPicker !== 'function') return;
	try {
		field.showPicker();
	} catch {
		return;
	}
}
