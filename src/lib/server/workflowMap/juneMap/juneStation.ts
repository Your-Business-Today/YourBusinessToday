/** A station of the June 2026 map of Jewel Bespoke Build, as a person's Claude would file it for Before. */
export function juneStation(key: string, name: string, summary: string, flow: { takesIn: string[]; produces: string[] }, doneIn: string) {
	return { key, name, summary, ...flow, doneIn, state: 'elsewhere' };
}
