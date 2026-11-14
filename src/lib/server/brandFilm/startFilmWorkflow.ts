import { env } from '$env/dynamic/private';

/** The GitHub workflow that films a brand's video, and the branch it runs from: the one the site deploys from. */
export const FilmWorkflow = {
	dispatchAddress: 'https://api.github.com/repos/Your-Business-Today/YourBusinessToday/actions/workflows/make-brand-film.yml/dispatches',
	branch: 'main'
} as const;

const dispatchedStatus = 204;

/** Starts the filming of one request on GitHub's runner; the reason it could not start, or null when it did. */
export async function startFilmWorkflow(filmMakingId: string): Promise<string | null> {
	if (!env.GITHUB_TOKEN) return 'the site has no GITHUB_TOKEN to start the filming with';
	const body = JSON.stringify({ ref: FilmWorkflow.branch, inputs: { filmMakingId } });
	const headers = { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' };
	try {
		const response = await fetch(FilmWorkflow.dispatchAddress, { method: 'POST', headers, body });
		const isDispatched = response.status === dispatchedStatus;
		if (isDispatched) return null;
		return `GitHub refused to start the filming (${response.status}); the site’s GITHUB_TOKEN needs Actions: write on the repository`;
	} catch {
		return 'GitHub could not be reached to start the filming';
	}
}
