import { caseStudyPath } from '$lib/data/caseStudies';
import { whatWeDoPath } from '$lib/data/consultancyOffer';
import { newsletterPath } from '$lib/data/newsletterSignUp';
import { taxCalculatorPath } from '$lib/data/taxCalculator/taxCalculatorPath';

const frontPagePath = '/';

/** The pages of the public site that search engines are asked to index. */
export const indexedPublicPagePaths = [
	frontPagePath,
	'/about',
	whatWeDoPath,
	caseStudyPath,
	taxCalculatorPath,
	'/demo',
	'/contact',
	newsletterPath,
	'/terms',
	'/privacy',
	'/company',
	'/links',
	'/account/sign-in'
];

/** Public pages kept out of the sitemap: shared by link rather than found by search. */
const unindexedPublicPagePaths = ['/case-studies', '/promo', '/offer', '/vision'];

const publicPagePaths = [...indexedPublicPagePaths, ...unindexedPublicPagePaths];

/** A page of the public site, or a page beneath one, that anyone may read whether or not they are signed in. */
export function isPublicPage(pathname: string): boolean {
	return publicPagePaths.some((path) => pathname === path || isBeneath(pathname, path));
}

function isBeneath(pathname: string, path: string): boolean {
	if (path === frontPagePath) return false;
	return pathname.startsWith(`${path}/`);
}
