import { domainPageKinds } from './businessBrainDomain';
import { readDomainPageFacts } from './businessBrainDomainFacts';
import { linksDrawnBetween, type DrawnPageRow, type FiledPageLink } from './businessBrainDrawingLinks';
import type { BrainContext, BrainPageLink, BrainPageSummary } from './brainTypes';

export type { DrawnPageRow, FiledPageLink } from './businessBrainDrawingLinks';

/** The organisation's brain as it is drawn: its areas as lobes, its other pages as neurons, and the links between them. */
export type BusinessBrainDrawing = { contexts: BrainContext[]; pageIndex: BrainPageSummary[]; pageLinks: BrainPageLink[] };

const mostParentsClimbed = 20;

/** Draws the brain from its pages and the links filed between them; a neuron is named by its page's id. */
export function drawBusinessBrain(pages: DrawnPageRow[], filedLinks: FiledPageLink[]): BusinessBrainDrawing {
	const pagesById = new Map(pages.map((page) => [page.id, page]));
	const areas = pages.filter(isArea);
	const neurons = pages.filter((page) => !isArea(page));
	const pageLinks = linksDrawnBetween(pages, filedLinks);
	return {
		contexts: areas.map(asContext),
		pageIndex: neurons.map((page) => asNeuron(page, areaOf(page, pagesById, pageLinks))),
		pageLinks
	};
}

function isArea(page: DrawnPageRow): boolean {
	return page.kind === domainPageKinds.boundedContext;
}

function asContext(area: DrawnPageRow): BrainContext {
	const { isCoreDomain } = readDomainPageFacts(area.facts);
	return { slug: area.id, name: area.title, summary: area.summary, isCoreDomain };
}

function asNeuron(page: DrawnPageRow, areaId: string | null): BrainPageSummary {
	return { slug: page.id, title: page.title, summary: page.summary, kind: page.kind, contextSlug: areaId };
}

/** The area a page is filed under, climbing its parents; else the area of the first page it links to that has one. */
function areaOf(page: DrawnPageRow, pagesById: Map<string, DrawnPageRow>, pageLinks: BrainPageLink[]): string | null {
	const filedArea = areaAbove(page, pagesById);
	if (filedArea !== null) return filedArea;
	const linkedPageIds = pageLinks.filter((link) => link.fromSlug === page.id).map((link) => link.toSlug);
	const linkedAreas = linkedPageIds.map((pageId) => pagesById.get(pageId)).map((linked) => linked && areaAtOrAbove(linked, pagesById));
	return linkedAreas.find((area) => typeof area === 'string') ?? null;
}

function areaAtOrAbove(page: DrawnPageRow, pagesById: Map<string, DrawnPageRow>): string | null {
	if (isArea(page)) return page.id;
	return areaAbove(page, pagesById);
}

function areaAbove(page: DrawnPageRow, pagesById: Map<string, DrawnPageRow>): string | null {
	let parentId = page.parentPageId;
	for (let climbed = 0; parentId !== null && climbed < mostParentsClimbed; climbed += 1) {
		const parent = pagesById.get(parentId);
		if (parent === undefined) return null;
		if (isArea(parent)) return parent.id;
		parentId = parent.parentPageId;
	}
	return null;
}
