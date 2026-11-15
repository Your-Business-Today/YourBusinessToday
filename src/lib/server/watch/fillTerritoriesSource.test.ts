import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WatchRun } from './watchRunRecord';

const notConfigured = 'Companies House is not configured.';
const { companiesHouse, pulled } = vi.hoisted(() => ({ companiesHouse: { isConfigured: true }, pulled: vi.fn() }));
let territories: Patch[] = [];
let lastPulls: Record<string, WatchRun> = {};

vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));
vi.mock('$lib/server/register/watchRegister', () => ({ companiesHouseNotConfigured: notConfigured }));
vi.mock('$lib/server/register/pullPatchCompanies', () => ({ pullPatchCompanies: vi.fn() }));
vi.mock('$lib/server/patches/listPatches', () => ({ listPatches: async () => territories }));
vi.mock('./watchRunLog', () => ({ readLatestRun: async (_supabase: unknown, source: string) => lastPulls[source] ?? null }));
vi.mock('./runWatchSource', () => ({ runWatchSource: pulled }));

const { fillTerritoriesSource } = await import('./fillTerritoriesSource');
const supabase = {} as SupabaseClient;
const aFreshStart = { resumeMarker: '', wasLastRunFinished: true };
const noProgress = async () => {};

const territoryOf = (id: string, name: string) => ({ id, name, outcodes: ['KT6'], sicCodes: [] }) as unknown as Patch;
const surbiton = territoryOf('surbiton-id', 'Surbiton');
const sutton = territoryOf('sutton-id', 'Sutton');
const woking = territoryOf('woking-id', 'Woking');

function pullOf(territory: Patch, startedAt: string, finishedAt: string | null): Record<string, WatchRun> {
	const source = `patch_companies:${territory.id}`;
	return { [source]: { id: `run-${territory.id}`, source, startedAt, finishedAt, rowsWritten: 0, resumeMarker: '', note: '' } };
}

function fill() {
	return fillTerritoriesSource.run(supabase, aFreshStart, noProgress);
}

describe('filling the territories nobody has filled', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		companiesHouse.isConfigured = true;
		territories = [surbiton, sutton, woking];
		lastPulls = {};
		pulled.mockResolvedValue({ source: 'patch_companies', rowsWritten: 9_000, resumeMarker: '', note: 'Every outcode pulled.', isFinished: true });
	});

	it('is finished, pulling nothing, when every territory has a finished pull', async () => {
		lastPulls = { ...pullOf(surbiton, '2026-11-15T16:00:00Z', '2026-11-15T16:04:00Z'), ...pullOf(sutton, '2026-11-15T16:10:00Z', '2026-11-15T16:14:00Z'), ...pullOf(woking, '2026-11-15T16:20:00Z', '2026-11-15T16:24:00Z') };
		expect(await fill()).toEqual({ rowsWritten: 0, resumeMarker: '', note: 'Every territory holds its companies.', isFinished: true });
		expect(pulled).not.toHaveBeenCalled();
	});

	it('pulls one territory a run, and is not finished while another is still to fill', async () => {
		lastPulls = pullOf(sutton, '2026-11-15T16:10:00Z', '2026-11-15T16:14:00Z');
		const outcome = await fill();
		expect(outcome).toEqual({ rowsWritten: 9_000, resumeMarker: surbiton.id, note: 'Surbiton: Every outcode pulled.', isFinished: false });
		expect(pulled).toHaveBeenCalledTimes(1);
	});

	it('is finished once it fills the last territory left', async () => {
		lastPulls = { ...pullOf(surbiton, '2026-11-15T16:00:00Z', '2026-11-15T16:04:00Z'), ...pullOf(sutton, '2026-11-15T16:10:00Z', '2026-11-15T16:14:00Z') };
		expect(await fill()).toMatchObject({ resumeMarker: woking.id, isFinished: true });
	});

	it('is not finished when the pull it carried on was cut off part way', async () => {
		lastPulls = { ...pullOf(surbiton, '2026-11-15T16:00:00Z', '2026-11-15T16:04:00Z'), ...pullOf(sutton, '2026-11-15T16:10:00Z', '2026-11-15T16:14:00Z') };
		pulled.mockResolvedValue({ source: 'patch_companies', rowsWritten: 4_000, resumeMarker: 'GU21', note: 'Out of time before GU22.', isFinished: false });
		expect(await fill()).toMatchObject({ rowsWritten: 4_000, note: 'Woking: Out of time before GU22.', isFinished: false });
	});

	it('takes the territory never tried before one whose pull keeps stopping, so a pull that fails never holds up the rest', async () => {
		lastPulls = { ...pullOf(surbiton, '2026-11-15T02:20:00Z', null), ...pullOf(sutton, '2026-11-14T02:20:00Z', null) };
		expect(await fill()).toMatchObject({ resumeMarker: woking.id });
		lastPulls = { ...lastPulls, ...pullOf(woking, '2026-11-15T03:20:00Z', null) };
		expect(await fill()).toMatchObject({ resumeMarker: sutton.id });
	});

	it('pulls nothing without a Companies House key, and says so', async () => {
		companiesHouse.isConfigured = false;
		expect(await fill()).toEqual({ rowsWritten: 0, resumeMarker: '', note: notConfigured, isFinished: true });
	});
});
