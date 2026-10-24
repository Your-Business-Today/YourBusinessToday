import { caseStudyPath } from '$lib/data/caseStudies';
import type { RequestHandler } from './$types';

const publicPagePaths = [
	'/',
	'/about',
	'/offer',
	caseStudyPath,
	'/demo',
	'/contact',
	'/terms',
	'/privacy',
	'/company',
	'/account/sign-in'
];

const XML_CONTENT_TYPE = 'application/xml';

export const GET: RequestHandler = ({ url }) => {
	return new Response(sitemapFor(url.origin), {
		headers: { 'content-type': XML_CONTENT_TYPE }
	});
};

function sitemapFor(origin: string): string {
	const urlEntries = publicPagePaths.map((path) => `  <url><loc>${origin}${path}</loc></url>`);
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urlEntries,
		'</urlset>'
	].join('\n');
}
