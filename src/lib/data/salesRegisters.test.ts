import { describe, expect, it } from 'vitest';
import { clientsRegister, leadsRegister, registerOfStage, stageOnRegister } from './salesRegisters';
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
