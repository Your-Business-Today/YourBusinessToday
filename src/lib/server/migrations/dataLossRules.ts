/** A kind of statement that takes away data already in the database, and how to say what it does. */
export type DataLossRule = { loss: string; pattern: RegExp };

const keptByAColumnDrop = String.raw`(?:constraint|not\s+null|default|identity|expression)\b`;
const keptByARename = String.raw`constraint\b`;

/** Every way a migration statement can take away data that is already there. */
export const dataLossRules: DataLossRule[] = [
	{ loss: 'drops a table', pattern: /\bdrop\s+(?:foreign\s+)?table\b/i },
	{ loss: 'drops a schema, and every table in it', pattern: /\bdrop\s+schema\b/i },
	{
		loss: 'drops a column',
		pattern: new RegExp(String.raw`\balter\s+table\b.*\bdrop\s+(?!\s*${keptByAColumnDrop})`, 'i')
	},
	{
		loss: 'renames a table or a column',
		pattern: new RegExp(String.raw`\balter\s+table\b.*\brename\s+(?!\s*${keptByARename})`, 'i')
	},
	{ loss: 'empties a table', pattern: /\btruncate\b/i },
	{ loss: 'deletes rows', pattern: /\bdelete\s+from\b/i },
	{ loss: 'drops a type or a domain with cascade, and the columns that use it', pattern: /\bdrop\s+(?:type|domain)\b.*\bcascade\b/i }
];
