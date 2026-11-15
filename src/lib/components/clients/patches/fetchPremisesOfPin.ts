import { premisesIdOfKey } from '$lib/data/premisesKeys';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Premises } from '$lib/server/premises/premisesRecord';

/** The record behind a premises pin, asked of the server when the pin is picked: the map carries pins, never every record. */
export async function fetchPremisesOfPin(patchId: string, pin: AreaPin): Promise<Premises> {
	const response = await fetch(`/clients/patches/${patchId}/premises/${premisesIdOfKey(pin.key)}`);
	if (!response.ok) throw new Error(`The premises behind ${pin.key} could not be read`);
	const body = (await response.json()) as { premises: Premises };
	return body.premises;
}
