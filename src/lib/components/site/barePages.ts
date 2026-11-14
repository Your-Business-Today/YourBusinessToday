const filmingPagesPath = '/brand-film/';

/** A page drawn alone, with no header, footer or frame around it: the words of a film being made, which the runner photographs. */
export function isBarePage(url: URL): boolean {
	return url.pathname.startsWith(filmingPagesPath);
}
