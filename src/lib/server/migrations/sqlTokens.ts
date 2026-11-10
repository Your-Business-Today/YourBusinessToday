/** The pieces of SQL text that open or close something the statement splitter has to step over. */
export const SqlTokens = {
	lineComment: '--',
	newLine: '\n',
	blockCommentOpen: '/*',
	blockCommentClose: '*/',
	quote: "'",
	identifierQuote: '"',
	statementEnd: ';',
	blankString: "''",
	blankBody: '$$'
} as const;
