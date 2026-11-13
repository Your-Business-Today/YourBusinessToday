import { standingNote } from '$lib/data/workflowMap/stationReviewWords';
import { standingOf, type StationStanding } from '$lib/data/workflowMap/stationReview';
import { stationState } from '$lib/data/workflowMap/workflowMap';
import type { MapStation } from '$lib/data/workflowMap/workflowMap';
import type { MapSurroundings } from './describeWorkflowMap';

/** A station as a numbered point with its details beneath: what it is, what it takes and gives, where it is done and its mark. */
export function describeMapStation(station: MapStation, position: number, surroundings: MapSurroundings): string {
	const { productNames, standings } = surroundings;
	const output = station.isOutput ? ', an output the business runs on' : '';
	const heading = `${position}. **${station.name}** \`${station.key}\`${output}: ${station.summary}`;
	const details = [
		wordsDetail('Takes in', station.takesIn),
		wordsDetail('Produces', station.produces),
		whereItIsDone(station, productNames),
		thingsDetail('Domain things taken in', station.takesInThings),
		thingsDetail('Domain things produced', station.producesThings),
		markDetail(standingOf(standings, station.key))
	].filter((detail) => detail !== '');
	return [heading, ...details.map((detail) => `   - ${detail}`)].join('\n');
}

function markDetail(standing: StationStanding): string {
	const note = standingNote(standing);
	if (standing.markedOnVersion === null) return note;
	return `${note} (marked on version ${standing.markedOnVersion}, unchanged since)`;
}

function wordsDetail(label: string, words: string[]): string {
	if (words.length === 0) return '';
	return `${label}: ${words.join('; ')}`;
}

function thingsDetail(label: string, slugs: string[]): string {
	if (slugs.length === 0) return '';
	return `${label}: ${slugs.map((slug) => `\`${slug}\``).join(', ')}`;
}

function whereItIsDone(station: MapStation, productNames: Map<string, string>): string {
	const doneToday = station.doneIn === null ? '' : `, done today in ${station.doneIn}`;
	if (station.state === stationState.elsewhere) return station.doneIn === null ? 'Done elsewhere' : `Done in ${station.doneIn}`;
	const product = productPhrase(station.productId, productNames);
	if (station.state === stationState.planned) return `Planned for ${product}${doneToday}`;
	return `Done in ${product}`;
}

function productPhrase(productId: string | null, productNames: Map<string, string>): string {
	if (productId === null) return 'one of our products';
	const name = productNames.get(productId) ?? 'a product';
	return `our product ${name} (\`${productId}\`)`;
}
