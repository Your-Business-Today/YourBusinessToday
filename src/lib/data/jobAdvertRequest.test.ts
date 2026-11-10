import { describe, expect, it } from 'vitest';
import { jobAdvertRequest } from './jobAdvertRequest';

const clientId = '11111111-1111-4111-8111-111111111111';

describe('jobAdvertRequest', () => {
	it('names a client on the register with its id, where it is and the action that keeps the adverts', () => {
		const request = jobAdvertRequest({ name: 'Acme Build', place: 'KT1 1EU', clientId });
		expect(request).toContain('Acme Build in KT1 1EU');
		expect(request).toContain(`client ${clientId}`);
		expect(request).toContain('save_company_job_adverts');
		expect(request).toContain('never LinkedIn');
	});

	it('asks only to be shown the adverts of a company not on the register', () => {
		const request = jobAdvertRequest({ name: 'Acme Build', place: '', clientId: null });
		expect(request).toContain('of Acme Build on the UK job boards');
		expect(request).not.toContain('save_company_job_adverts');
	});
});
