export type Refusal = { refusal: string };

export function isRefusal(reading: object): reading is Refusal {
	return 'refusal' in reading;
}

/** A field's typed value, trimmed; an empty string when it was left out. */
export function textOf(formData: FormData, field: string): string {
	return String(formData.get(field) ?? '').trim();
}

export function tooLong(field: string, limit: number): Refusal {
	return { refusal: `${field} is too long: keep it to ${limit} characters.` };
}

/** Reads one named value, trimmed: a form's field or a connector call's input. */
export type ValueReader = (field: string) => string;

export function formValues(formData: FormData): ValueReader {
	return (field) => textOf(formData, field);
}

export function inputValues(input: Record<string, unknown>): ValueReader {
	return (field) => String(input[field] ?? '').trim();
}
