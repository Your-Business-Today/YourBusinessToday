import { describe, expect, it, vi } from 'vitest';
import { basemapFor } from './basemap';

vi.mock('$env/dynamic/public', () => ({ env: {} }));

describe('basemapFor', () => {
	it('draws Ordnance Survey with the Crown copyright line and the open zoom limit when a key is set', () => {
		const { tileUrl, attribution, maxZoom } = basemapFor('an-os-key', 2026);
		expect(tileUrl).toContain('maps/raster/v1/zxy/Light_3857');
		expect(tileUrl).toContain('key=an-os-key');
		expect(attribution).toContain('Crown copyright and database rights 2026');
		expect(maxZoom).toBe(16);
	});

	it('falls back to OpenStreetMap, credited, when no key is set', () => {
		const { tileUrl, attribution } = basemapFor('', 2026);
		expect(tileUrl).toContain('openstreetmap.org');
		expect(attribution).toContain('OpenStreetMap');
	});
});
