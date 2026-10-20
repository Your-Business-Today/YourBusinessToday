const commitShaPattern = /^[0-9a-f]{40}$/;

/** A full git commit SHA as GitHub gives it: forty lower-case hex digits, as task_merge_deploys.commit_sha holds. */
export function isCommitSha(value: string): boolean {
	return commitShaPattern.test(value);
}

/** The commit SHA, or '' when GitHub gave none or something that is not one. */
export function commitShaOrNone(value: string | null | undefined): string {
	const candidate = value ?? '';
	return isCommitSha(candidate) ? candidate : '';
}
