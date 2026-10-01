const PostgresErrorCode = {
	InvalidTextRepresentation: '22P02',
	ForeignKeyViolation: '23503',
	UniqueViolation: '23505',
	UndefinedTable: '42P01'
} as const;

const PostgrestErrorCode = {
	TableNotInSchema: 'PGRST205'
} as const;

const missingTableSentence =
	'This action needs a database change that has not been applied yet, so it fails whatever you ' +
	'pass and retrying will not help. Tell the person, so the missing migration can be run.';

const sentencesByPostgresError: Record<string, string> = {
	[PostgresErrorCode.InvalidTextRepresentation]:
		'One of the ids you passed is not a valid id. Use ids exactly as the list and read actions return them.',
	[PostgresErrorCode.ForeignKeyViolation]:
		'One of the ids you passed does not belong to anything here. Check it with a list action first.',
	[PostgresErrorCode.UniqueViolation]: 'That would duplicate something that already exists.',
	[PostgresErrorCode.UndefinedTable]: missingTableSentence,
	[PostgrestErrorCode.TableNotInSchema]: missingTableSentence
};

export const transientFailureSentence = 'That did not work. Try again shortly.';

export function toolFailureSentence(failure: unknown): string {
	return sentencesByPostgresError[postgresErrorCode(failure)] ?? transientFailureSentence;
}

function postgresErrorCode(failure: unknown): string {
	if (typeof failure !== 'object' || failure === null) return '';
	return String((failure as { code?: unknown }).code ?? '');
}
