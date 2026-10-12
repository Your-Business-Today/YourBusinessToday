import { entriesIn, parseGazetteNotice, type GazetteNotice } from './gazetteNoticeRecord';
import { gazetteOrigin, requestGazette } from './requestGazette';

const feedPath = '/insolvency/notice/data.json';
const corporateInsolvency = '24';
const pageSize = 100;
const mostPages = 10;

/** Every corporate insolvency notice published on one day, page by page, keeping only the kinds the feed carries. */
export async function listInsolvencyNotices(publishedOn: string): Promise<GazetteNotice[]> {
	const notices: GazetteNotice[] = [];
	for (let page = 1; page <= mostPages; page += 1) {
		const body = await requestGazette(feedUrl(publishedOn, page));
		const entries = entriesIn(body);
		notices.push(...entries.flatMap((entry) => {
			const notice = parseGazetteNotice(entry);
			return notice === null ? [] : [notice];
		}));
		if (entries.length < pageSize) return notices;
	}
	return notices;
}

function feedUrl(publishedOn: string, page: number): URL {
	const url = new URL(feedPath, gazetteOrigin);
	url.searchParams.set('categorycode', corporateInsolvency);
	url.searchParams.set('start-publish-date', publishedOn);
	url.searchParams.set('end-publish-date', publishedOn);
	url.searchParams.set('results-page-size', String(pageSize));
	url.searchParams.set('results-page', String(page));
	return url;
}
