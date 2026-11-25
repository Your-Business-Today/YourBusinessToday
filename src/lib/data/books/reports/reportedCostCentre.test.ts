import { describe, expect, it } from 'vitest';
import { reportedCostCentreOf } from './reportedCostCentre';

const marketing = { id: 'cost-centre-1', name: 'Sales lead', isArchived: false };

describe('reportedCostCentreOf', () => {
	it('names the project a cost centre is kept for beside its own name', () => {
		expect(reportedCostCentreOf(marketing, 'ConservAqua Portal').label).toBe('Sales lead (ConservAqua Portal)');
	});

	it('gives the name alone when it is kept for no project or is named for it', () => {
		expect(reportedCostCentreOf(marketing, null).label).toBe('Sales lead');
		expect(reportedCostCentreOf({ ...marketing, name: 'Carp Mania' }, 'Carp Mania').label).toBe('Carp Mania');
	});
});
