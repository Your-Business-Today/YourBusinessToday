import { distanceInMetres, type Coordinates } from './distance';
import type { AreaPin } from '$lib/server/clients/area/areaPin';

/** A business is in or beside a building when its own geocode or full address puts it within this of the centre. */
export const buildingNearbyMetres = 30;

/** Only records that stand at their own address count: a premises, or a sighting that gave one. Never a registered office. */
export function pinsBeside(building: Coordinates, pins: AreaPin[]): AreaPin[] {
	return pins
		.filter((pin) => pin.isPremises || (pin.isSighting && pin.address !== ''))
		.filter((pin) => distanceInMetres(building, pin) <= buildingNearbyMetres);
}

/** The companies whose registered office is the building's nearest postcode: listed apart, with no claim they trade there. */
export function pinsRegisteredAt(postcode: string, pins: AreaPin[]): AreaPin[] {
	if (postcode === '') return [];
	return pins.filter((pin) => !pin.isPremises && !pin.isSighting && pin.postcode === postcode);
}

export function hasAnythingKnown(building: Coordinates, pins: AreaPin[]): boolean {
	return pinsBeside(building, pins).length > 0;
}
