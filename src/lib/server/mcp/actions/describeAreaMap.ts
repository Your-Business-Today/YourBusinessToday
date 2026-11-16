import { companiesHouseKeyNote, describeAreaSummary } from '$lib/components/clients/map/areaSummary';
import { pinTones, standingOfPin } from '$lib/components/clients/map/areaPinTones';
import { describeDistance } from '$lib/data/distance';
import { isHub } from '$lib/data/registerRules';
import type { AreaMap } from '$lib/server/clients/area/mapArea';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import { describePagePlace, describePastLastPage, isPastLastPage, pageOf } from './areaMapPages';

/** The map as the page shows it: its summary, then one page of its pins nearest first, each as the list beside the map lists it. */
export function describeAreaMap(area: AreaMap, pageNumber: number): string {
	const { pins } = area;
	const page = pageOf(pins.length, pageNumber);
	if (isPastLastPage(page)) return describePastLastPage(page);
	const keyNote = area.isSearchedOnCompaniesHouse ? [] : [companiesHouseKeyNote];
	const pagePins = pins.slice(page.firstIndex, page.lastIndex);
	return [describeAreaSummary(area), ...keyNote, ...describePagePlace(page), ...pagePins.map(describePin)].join('\n');
}

function describePin(pin: AreaPin): string {
	const { label } = pinTones[standingOfPin(pin)];
	const facts = [pin.name, pin.address, describeDistance(pin.distanceMiles), label, ...pinFacts(pin)];
	return facts.filter((fact) => fact !== '').join(' — ');
}

function pinFacts(pin: AreaPin): string[] {
	const { standing, sicCodes } = pin;
	return [
		isHub(pin) ? `holding ${pin.companyCount} companies` : '',
		pin.statusNote,
		sicCodes.length === 0 ? '' : `SIC ${sicCodes.join(', ')}`,
		pin.incorporatedOn === '' ? '' : `incorporated ${pin.incorporatedOn}`,
		pin.companyNumber === '' ? '' : `company ${pin.companyNumber}`,
		standing === null ? '' : `client ${standing.clientId}`
	];
}
