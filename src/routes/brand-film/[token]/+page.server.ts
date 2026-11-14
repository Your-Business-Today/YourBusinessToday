import { error } from '@sveltejs/kit';
import { readFilmingPage } from '$lib/server/brandFilm/readFilmingPage';
import type { PageServerLoad } from './$types';

const shapeParameter = 'shape';

/** The words of a film being made, for GitHub's runner to photograph: no sign-in, because the token is the permission. */
export const load: PageServerLoad = async ({ params, url }) => {
	const filming = await readFilmingPage(params.token, url.searchParams.get(shapeParameter));
	if (filming === null) error(404, 'No film is being made under this link');
	return filming;
};
