import { describe, expect, it, vi } from 'vitest';
import { recordBusinessBrainFile } from './recordBusinessBrainFile';
import type { BusinessBrainFile } from './businessBrainFileRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const later = '2999-01-01T00:00:00Z';
const earlier = '2000-01-01T00:00:00Z';
const aGrantedFile: BusinessBrainFile = {
	id: 'file-1',
	organisationId: 'jewel',
	filename: 'handbook.pdf',
	mimeType: 'application/pdf',
	byteCount: null,
	storagePath: 'jewel/file-1/handbook.pdf',
	sentBy: 'nigel',
	expiresAt: later,
	recordedAt: null
};

function storageHolding(size: number | null, claimedRows: number) {
	const update = vi.fn();
	const remove = vi.fn();
	const claim = { eq: () => claim, is: () => claim, select: async () => ({ data: Array.from({ length: claimedRows }, () => ({ id: 'file-1' })), error: null }) };
	const supabase = {
		storage: {
			from: () => ({
				info: async () => (size === null ? { data: null, error: new Error('not found') } : { data: { size }, error: null }),
				remove
			})
		},
		from: () => ({ update: (values: unknown) => (update(values), claim) })
	} as unknown as SupabaseClient;
	return { supabase, update, remove };
}

describe('recording a source file sent to its link', () => {
	it('keeps it at the size that actually arrived', async () => {
		const { supabase, update } = storageHolding(4096, 1);
		expect(await recordBusinessBrainFile(supabase, aGrantedFile)).toEqual({ status: 'recorded', byteCount: 4096 });
		expect(update).toHaveBeenCalledWith(expect.objectContaining({ byte_count: 4096 }));
	});

	it('keeps a file that arrived even after its link has lapsed, and deletes nothing', async () => {
		const { supabase, remove } = storageHolding(4096, 1);
		expect(await recordBusinessBrainFile(supabase, { ...aGrantedFile, expiresAt: earlier })).toEqual({ status: 'recorded', byteCount: 4096 });
		expect(remove).not.toHaveBeenCalled();
	});

	it('waits for a file not yet sent, and says when the link lapsed unused', async () => {
		expect(await recordBusinessBrainFile(storageHolding(null, 0).supabase, aGrantedFile)).toEqual({ status: 'not_arrived' });
		expect(await recordBusinessBrainFile(storageHolding(null, 0).supabase, { ...aGrantedFile, expiresAt: earlier })).toEqual({ status: 'lapsed' });
	});

	it('records a file once, however often it is asked', async () => {
		expect(await recordBusinessBrainFile(storageHolding(4096, 0).supabase, aGrantedFile)).toEqual({ status: 'already_recorded' });
		expect(await recordBusinessBrainFile(storageHolding(4096, 1).supabase, { ...aGrantedFile, recordedAt: earlier })).toEqual({ status: 'already_recorded' });
	});
});
