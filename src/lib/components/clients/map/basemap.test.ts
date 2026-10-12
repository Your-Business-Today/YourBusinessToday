import { describe, expect, it, vi } from 'vitest';
import { basemapFor } from './basemap';

vi.mock('$env/dynamic/public', () => ({ env: {} }));

describe('basemapFor', () => {
	it('draws Ordnance Survey from the zoom it serves, with OpenStreetMap for the country-wide view above, when a key is set', () => {
		const [countryWide, ordnanceSurvey] = basemapFor('an-os-key', 2026);
		expect(countryWide.tileUrl).toContain('openstreetmap.org');
		expect(countryWide.maxZoom).toBe(6);
		expect(ordnanceSurvey.tileUrl).toContain('maps/raster/v1/zxy/Light_3857');
		expect(ordnanceSurvey.tileUrl).toContain('key=an-os-key');
		expect(ordnanceSurvey.attribution).toContain('Crown copyright and database rights 2026');
		expect(ordnanceSurvey.minZoom).toBe(7);
		expect(ordnanceSurvey.maxZoom).toBe(16);
	});

	it('falls back to OpenStreetMap alone, credited, when no key is set', () => {
		const sources = basemapFor('', 2026);
		expect(sources).toHaveLength(1);
		expect(sources[0].tileUrl).toContain('openstreetmap.org');
		expect(sources[0].attribution).toContain('OpenStreetMap');
	});
});
