import type { MapServiceOutline, PlannedProduct, PlannedStation } from '$lib/data/workflowMap/mapServiceOutline';

const productNotNamedYet = 'A product not named yet';

/** The services a confirmed map suggests: one product at a time, its planned stations, then what goes wrong today. */
export function mapServiceOutlineSection(outline: MapServiceOutline, productNames: Map<string, string>): string {
	return [
		'### Services to propose: the stations planned for our products',
		...plannedLines(outline.products, productNames),
		'',
		'### Hand-overs that go wrong today',
		...troubleLines(outline)
	].join('\n');
}

function plannedLines(products: PlannedProduct[], productNames: Map<string, string>): string[] {
	if (products.length === 0) return ['No station on this version is planned for a product yet: start from the hand-overs below.'];
	return products.flatMap(({ productId, stations }) => [productHeading(productId, productNames), ...stations.map(stationLine)]);
}

function productHeading(productId: string | null, productNames: Map<string, string>): string {
	if (productId === null) return `${productNotNamedYet}:`;
	const name = productNames.get(productId) ?? productId;
	return `${name} (project id: ${productId}):`;
}

function stationLine({ station, lineName, goesWrong }: PlannedStation): string {
	const output = station.isOutput ? ', an output the business runs on' : '';
	const troubles = goesWrong.length === 0 ? '' : ` Goes wrong today: ${goesWrong.join(' ')}`;
	return `- ${station.name} \`${station.key}\` (${lineName})${output}: ${station.summary}${troubles}`;
}

function troubleLines({ troubledHandovers }: MapServiceOutline): string[] {
	if (troubledHandovers.length === 0) return ['None filed on this version.'];
	return troubledHandovers.map(({ fromName, toName, handedOver, goesWrong }) => {
		return `- ${fromName} hands ${handedOver} to ${toName}: ${goesWrong}`;
	});
}
