import { contractPackSigningLimits as limits, type PackCommentGiven } from '$lib/data/contractPackSigningRules';
import { validateRecordId } from '$lib/data/isUuid';

/** The comment as given, each value within its column's limit, or why not, naming the field. */
export function validatePackComment(input: Record<string, unknown>): PackCommentGiven | string {
	const documentId = String(input.documentId ?? '').trim();
	const idRefusal = validateRecordId('documentId', documentId);
	if (idRefusal !== null) return idRefusal;
	const clause = String(input.clause ?? '').trim();
	if (clause.length > limits.longestClause) return `The clause is at most ${limits.longestClause} characters, such as "9.1".`;
	const comment = String(input.comment ?? '').trim();
	if (comment === '') return 'Write the comment.';
	if (comment.length > limits.longestComment) return `The comment is ${comment.length} characters; at most ${limits.longestComment}.`;
	return { documentId, clause, comment };
}
