import { describe, expect, it, vi } from 'vitest';
import { findEmailSender } from './findEmailSender';
import type { SupabaseClient } from '@supabase/supabase-js';

const { finding } = vi.hoisted(() => ({ finding: vi.fn() }));
vi.mock('./findRecordsForEmail', () => ({ findRecordsForEmail: finding }));

const supabase = {} as SupabaseClient;
const acme = { id: 'client-acme', name: 'Acme Ltd', stage: 'client' };
const beta = { id: 'client-beta', name: 'Beta Ltd', stage: 'lead' };

describe('findEmailSender', () => {
	it('names the one client a person we hold is at, and the person', async () => {
		finding.mockResolvedValue([{ address: 'jo@acme.example', kind: 'person', personId: 'person-jo', personName: 'Jo', companies: [acme] }]);
		expect(await findEmailSender(supabase, 'jo@acme.example')).toEqual({ client: acme, personId: 'person-jo' });
	});

	it('names no client when the sender is at several, or nobody we hold', async () => {
		finding.mockResolvedValue([{ address: 'jo@acme.example', kind: 'website', domain: 'acme.example', companies: [acme, beta] }]);
		expect(await findEmailSender(supabase, 'jo@acme.example')).toEqual({ client: null, personId: null });
		finding.mockResolvedValue([{ address: 'jo@gmail.com', kind: 'nobody' }]);
		expect(await findEmailSender(supabase, 'jo@gmail.com')).toEqual({ client: null, personId: null });
	});
});
