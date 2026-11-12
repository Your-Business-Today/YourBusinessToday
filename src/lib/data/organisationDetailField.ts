export const detailKinds = { line: 'line', lines: 'lines', email: 'email' } as const;

/** How a detail is typed: on one line, over several lines, or as an email address. */
export type DetailKind = (typeof detailKinds)[keyof typeof detailKinds];

/** One thing we hold about an organisation: the column it is stored in, how it reads and how long it may be. */
export type DetailFieldOf<Key extends string> = {
	key: Key;
	column: string;
	label: string;
	longest: number;
	kind: DetailKind;
	meaning: string;
};

/** The details that belong together, under the one heading the page gives them. */
export type DetailGroupOf<Key extends string> = {
	key: string;
	title: string;
	fields: readonly DetailFieldOf<Key>[];
};
