const pathSeparator = '/';

const framedSections = [
	'/admin',
	'/clients',
	'/leads',
	'/notifications',
	'/organisations',
	'/people',
	'/portal',
	'/projects'
];

const framedPages = new Set(['/account']);

/** A path is at a section when it is the section itself or a page beneath it. */
export function isAtOrUnder(pathname: string, sectionPath: string): boolean {
	return pathname === sectionPath || pathname.startsWith(`${sectionPath}${pathSeparator}`);
}

/**
 * The pages a signed-in person works in wear the portal frame; the public pages (home, the offer,
 * the case study, About, sign-in and the rest) keep the public header and footer.
 */
export function isFramedPath(pathname: string): boolean {
	if (framedPages.has(pathname)) return true;
	return framedSections.some((sectionPath) => isAtOrUnder(pathname, sectionPath));
}

export function isFramedPage(url: URL): boolean {
	const { pathname } = url;
	return isFramedPath(pathname);
}
