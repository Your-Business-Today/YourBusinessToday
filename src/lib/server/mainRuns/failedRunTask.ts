import type { FinishedRun } from '$lib/data/mainRun';

const addressSeparators = /[/:]/;
const gitSuffix = /\.git$/;
const trailingSlashes = /\/+$/;

/** The repository's own name, as written: the last part of its address. */
export function repositoryNameOf(repositoryUrl: string): string {
	const address = repositoryUrl.trim().replace(trailingSlashes, '').replace(gitSuffix, '');
	const parts = address.split(addressSeparators);
	return parts[parts.length - 1];
}

export function failedRunTitle(run: FinishedRun, defaultBranch: string): string {
	return `FIX: ${run.checkName} failed on ${defaultBranch} in ${repositoryNameOf(run.repositoryUrl)}`;
}

export function failedRunDetails(run: FinishedRun): string {
	return [
		`${run.checkName} failed on the default branch at ${run.finishedAt}.`,
		'',
		`- The run: ${run.runUrl}`,
		'- Find why it failed and fix it forward with a pull request.'
	].join('\n');
}
