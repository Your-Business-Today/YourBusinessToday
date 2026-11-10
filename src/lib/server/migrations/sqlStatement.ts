/** A dollar-quoted body inside a statement, with the line of the file it starts on. */
export type SqlBody = { sql: string; line: number };

/** One statement as it runs: comments gone, strings blanked, dollar-quoted bodies set aside. */
export type SqlStatement = { code: string; text: string; line: number; bodies: SqlBody[] };
