import { describe, expect, it } from 'vitest';
import { clientsRegister, companyPagePath, leadsRegister, registerOfStage, salesRegisterSegments, stageOnRegister } from './salesRegisters';
import { clientStageOrder } from './clientLifecycle';

describe('registerOfStage', () => {
	it('keeps a company on Leads until it signs, and on Clients once it has', () => {
		expect(registerOfStage('lead')).toBe(leadsRegister);
		expect(registerOfStage('prospect')).toBe(leadsRegister);
		expect(registerOfStage('lost')).toBe(leadsRegister);
		expect(registerOfStage('client')).toBe(clientsRegister);
		expect(registerOfStage('dormant')).toBe(clientsRegister);
	});

	it('puts every stage on exactly one register, so no record is left off both', () => {
		const stagesOnRegisters = [...leadsRegister.stages, ...clientsRegister.stages];
		expect([...stagesOnRegisters].sort()).toEqual([...clientStageOrder].sort());
	});
});

describe('stageOnRegister', () => {
	it('reads a stage of the register as its tab, and anything else as all', () => {
		expect(stageOnRegister(leadsRegister, 'prospect')).toBe('prospect');
		expect(stageOnRegister(leadsRegister, 'client')).toBeNull();
		expect(stageOnRegister(clientsRegister, null)).toBeNull();
	});
});

describe('companyPagePath', () => {
	const companyId = 'a29a0e0e-3a9e-434f-b1c4-1201ff18dec3';

	it('opens a lead under Leads and a signed client under Clients', () => {
		expect(companyPagePath({ id: companyId, stage: 'lead' })).toBe(`/leads/${companyId}`);
		expect(companyPagePath({ id: companyId, stage: 'client' })).toBe(`/clients/${companyId}`);
	});

	it('names only the two registers as a company page can sit under', () => {
		expect(salesRegisterSegments).toEqual(['leads', 'clients']);
	});
});
