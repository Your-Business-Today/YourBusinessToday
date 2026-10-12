/** A local authority as the agency lists it, with the open-data file it publishes and when it last did. */
export type FoodAuthority = {
	code: string;
	name: string;
	fileName: string;
	publishedOn: string | null;
	establishmentCount: number;
};

const fileExtension = /\.(xml|json)$/i;

export function parseFoodAuthority(value: unknown): FoodAuthority | null {
	if (typeof value !== 'object' || value === null) return null;
	const row = value as Record<string, unknown>;
	const code = String(row.LocalAuthorityIdCode ?? '').trim();
	const name = String(row.Name ?? '').trim();
	if (code === '' || name === '') return null;
	return {
		code,
		name,
		fileName: fileNameOf(String(row.FileName ?? '')),
		publishedOn: dateOf(row.LastPublishedDate),
		establishmentCount: Number(row.EstablishmentCount ?? 0) || 0
	};
}

/** The file's own name without its path or extension: FHRS508en-GB, which the JSON endpoint is asked for by. */
export function fileNameOf(fileUrl: string): string {
	const lastSegment = fileUrl.split('/').pop() ?? '';
	return lastSegment.replace(fileExtension, '');
}

function dateOf(value: unknown): string | null {
	const text = String(value ?? '');
	if (text === '') return null;
	const date = new Date(text);
	const isNotADate = Number.isNaN(date.getTime());
	if (isNotADate) return null;
	return date.toISOString().slice(0, 10);
}
