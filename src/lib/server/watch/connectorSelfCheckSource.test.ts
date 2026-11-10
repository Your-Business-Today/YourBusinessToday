import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { connectorSelfCheckSource } from './connectorSelfCheckSource';
import { WatchCheckFailure } from './watchCheckFailure';

const checkConnector = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/mcp/selfCheck/checkConnector', () => ({ checkConnector }));

const anyDatabase = {} as SupabaseClient;
const aFreshStart = { resumeMarker: '', wasLastRunFinished: true };
const noProgress = async () => {};

function runTheCheck() {
	return connectorSelfCheckSource.run(anyDatabase, aFreshStart, noProgress);
}

describe('the connector self-check watch source', () => {
	it('finishes, writing nothing, when the connector passes', async () => {
		checkConnector.mockResolvedValueOnce({ callsMade: 15, failures: [] });
		const outcome = await runTheCheck();
		expect(outcome).toMatchObject({ rowsWritten: 0, isFinished: true });
		expect(outcome.note).toContain('answered all 15 of its reads');
	});

	it('fails the check with every failure in its finding', async () => {
		const failures = ['find_tasks no longer offered', 'run_read_action read_project failed: That did not work'];
		checkConnector.mockResolvedValue({ callsMade: 15, failures });
		await expect(runTheCheck()).rejects.toBeInstanceOf(WatchCheckFailure);
		await expect(runTheCheck()).rejects.toThrow(failures.join('; '));
	});
});
