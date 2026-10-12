import type { ClientStage } from '$lib/data/clientLifecycle';
import { isHub } from '$lib/data/hubPins';
import type { AreaPin } from '$lib/server/clients/area/areaPin';

export type PinStanding = ClientStage | 'unlisted' | 'hub' | 'nonTrading';

export type PinTone = { colourToken: string; fillOpacity: number; label: string };

export const pinToneOrder: PinStanding[] = ['unlisted', 'lead', 'prospect', 'client', 'dormant', 'lost', 'hub', 'nonTrading'];

export const pinTones: Record<PinStanding, PinTone> = {
	unlisted: { colourToken: '--color-etch', fillOpacity: 0.35, label: 'Not on the register' },
	lead: { colourToken: '--color-chalk', fillOpacity: 0.9, label: 'Lead' },
	prospect: { colourToken: '--color-caution', fillOpacity: 0.9, label: 'Prospect' },
	client: { colourToken: '--color-go', fillOpacity: 0.9, label: 'Client' },
	dormant: { colourToken: '--color-slate', fillOpacity: 0.9, label: 'Dormant' },
	lost: { colourToken: '--color-signal', fillOpacity: 0.6, label: 'Lost' },
	hub: { colourToken: '--color-caution', fillOpacity: 0.35, label: 'Registered-office hub' },
	nonTrading: { colourToken: '--color-etch', fillOpacity: 0.12, label: 'Dormant or no accounts filed' }
};

export function standingOf(stage: ClientStage | null): PinStanding {
	if (stage === null) return 'unlisted';
	return stage;
}

/** What a pin is drawn as: our standing with it first, then whether it is a hub or a shell. */
export function standingOfPin(pin: AreaPin): PinStanding {
	const { standing } = pin;
	if (standing !== null) return standing.stage;
	if (isHub(pin)) return 'hub';
	if (pin.isNonTrading) return 'nonTrading';
	return 'unlisted';
}

export function resolveColourToken(token: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}
