import { gazetteNoticeKindOf, type GazetteNoticeKind } from '$lib/data/gazetteNotices';
import { normaliseCompanyNumber } from '$lib/data/prospectRules';

/** One notice as the feed lists it: what it is, when, where it is, and the company number when the text carries one. Nothing personal is kept. */
export type GazetteNotice = { noticeId: string; noticeUrl: string; kind: GazetteNoticeKind; publishedOn: string; companyNumber: string };

const noticeIdShape = /\/notice\/(\d+)/;
const companyNumberInText = /company\s*(?:registration\s*)?(?:number|no\.?)[:\s]*([A-Z]{0,2}\s?\d{6,8})/i;
const anyTag = /<[^>]+>/g;

/** The notice, or null when it is a kind the feed does not carry or has no id. */
export function parseGazetteNotice(value: unknown): GazetteNotice | null {
	if (typeof value !== 'object' || value === null) return null;
	const entry = value as Record<string, unknown>;
	const noticeUrl = String(entry.id ?? '');
	const noticeId = noticeIdShape.exec(noticeUrl)?.[1] ?? '';
	const kind = gazetteNoticeKindOf(String(entry['f:notice-code'] ?? ''), String(entry.title ?? ''));
	if (noticeId === '' || kind === null) return null;
	return { noticeId, noticeUrl, kind, publishedOn: String(entry.published ?? '').slice(0, 10), companyNumber: companyNumberIn(entry.content) };
}

/** The company number the notice text names, or '' when the text does not carry one and the notice's own data must be asked. */
export function companyNumberIn(content: unknown): string {
	const text = String(content ?? '').replace(anyTag, ' ');
	const match = companyNumberInText.exec(text);
	return match === null ? '' : normaliseCompanyNumber(match[1]);
}

/** The feed renders one entry as an object and many as an array. */
export function entriesIn(body: unknown): unknown[] {
	const feed = (body as { feed?: { entry?: unknown } })?.feed;
	const entry = feed?.entry;
	if (Array.isArray(entry)) return entry;
	return entry === undefined || entry === null ? [] : [entry];
}
