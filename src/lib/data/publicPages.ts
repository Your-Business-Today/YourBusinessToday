import { caseStudyPath } from '$lib/data/caseStudies';
import { whatWeDoPath } from '$lib/data/consultancyOffer';
import { newsletterPath } from '$lib/data/newsletterSignUp';
import { taxCalculatorPath } from '$lib/data/taxCalculator/taxCalculatorPath';

export const homePagePath = '/';

/** The public site anyone can read, signed in or not: the pages search engines are told about. */
export const publicPagePaths = [
	homePagePath,
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
