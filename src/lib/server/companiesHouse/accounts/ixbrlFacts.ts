/** One tagged number in an inline XBRL document, and the period its context names. */
export type IxbrlFact = { name: string; contextRef: string; value: number };

export type IxbrlContext = { id: string; endsOn: string; hasSegment: boolean };

const nonFractionTag = /<ix:nonFraction\b([^>]*)>([\s\S]*?)<\/ix:nonFraction>/gi;
const contextTag = /<xbrli:context\b([^>]*)>([\s\S]*?)<\/xbrli:context>/gi;
const attributeOf = (attributes: string, name: string) => new RegExp(`\\b${name}="([^"]*)"`, 'i').exec(attributes)?.[1] ?? '';
const anyTag = /<[^>]+>/g;
const dateIn = /<xbrli:(?:endDate|instant)>\s*(\d{4}-\d{2}-\d{2})/i;
const segmentTag = /<xbrli:segment\b/i;
const commaDecimal = /commadecimal/i;
const minus = '-';

export function readIxbrlFacts(document: string): IxbrlFact[] {
	return [...document.matchAll(nonFractionTag)].flatMap(([, attributes, inner]) => {
		const value = numberOf(inner.replace(anyTag, ''), attributes);
		if (value === null) return [];
		return [{ name: localNameOf(attributeOf(attributes, 'name')), contextRef: attributeOf(attributes, 'contextRef'), value }];
	});
}

export function readIxbrlContexts(document: string): Map<string, IxbrlContext> {
	const contexts = [...document.matchAll(contextTag)].map(([, attributes, inner]) => ({
		id: attributeOf(attributes, 'id'),
		endsOn: dateIn.exec(inner)?.[1] ?? '',
		hasSegment: segmentTag.test(inner)
	}));
	return new Map(contexts.map((context) => [context.id, context]));
}

/** The concept without its taxonomy prefix: core:NetAssetsLiabilities and uk-core:NetAssetsLiabilities are one name. */
function localNameOf(qualifiedName: string): string {
	return qualifiedName.split(':').pop() ?? qualifiedName;
}

function numberOf(text: string, attributes: string): number | null {
	const isCommaDecimal = commaDecimal.test(attributeOf(attributes, 'format'));
	const digits = isCommaDecimal ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
	const magnitude = Number(digits.replace(/[^\d.]/g, ''));
	if (digits.trim() === '' || Number.isNaN(magnitude)) return null;
	const scale = Number(attributeOf(attributes, 'scale') || 0);
	const sign = attributeOf(attributes, 'sign') === minus ? -1 : 1;
	return sign * magnitude * 10 ** scale;
}
