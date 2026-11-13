import type { BusinessBrainPageGlance } from '$lib/server/businessBrain/readBusinessBrainPageGlance';

/** How far the reading of an opened page has got. */
export const glanceStates = { reading: 'reading', read: 'read', unreadable: 'unreadable' } as const;

export type GlanceState = (typeof glanceStates)[keyof typeof glanceStates];

/** The opened page's words, fetched when its neuron is opened, so the brain itself stays light to load. */
export class PageGlanceReading {
	state = $state<GlanceState>(glanceStates.reading);
	glance = $state<BusinessBrainPageGlance | null>(null);

	/** Reads the page at the address given, and answers a function that abandons the reading. */
	read(glanceHref: string): () => void {
		const abandon = new AbortController();
		const { signal } = abandon;
		this.state = glanceStates.reading;
		this.glance = null;
		fetch(glanceHref, { signal })
			.then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText))))
			.then((glance: BusinessBrainPageGlance) => this.hold(glance))
			.catch(() => this.giveUpUnless(signal.aborted));
		return () => abandon.abort();
	}

	private hold(glance: BusinessBrainPageGlance): void {
		this.glance = glance;
		this.state = glanceStates.read;
	}

	private giveUpUnless(wasAbandoned: boolean): void {
		if (wasAbandoned) return;
		this.state = glanceStates.unreadable;
	}
}
