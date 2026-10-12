/** What a sector was searched with: a person on the open web, or a source a person read a file or feed from. */
export type SearchSource = 'open_web' | 'register_file' | 'food_hygiene' | 'gazette' | 'companies_house';

export const searchSourceOrder: SearchSource[] = ['open_web', 'register_file', 'food_hygiene', 'gazette', 'companies_house'];

export const searchSourceLabels: Record<SearchSource, string> = {
	open_web: 'the open web',
	register_file: 'the register file',
	food_hygiene: 'the Food Standards Agency',
	gazette: 'The Gazette',
	companies_house: 'Companies House'
};

export function parseSearchSource(value: unknown): SearchSource | null {
	return searchSourceOrder.find((candidate) => candidate === value) ?? null;
}
