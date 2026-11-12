import { describe, expect, it } from 'vitest';
import { practiceSystems } from '$lib/data/demo/seed/bookkeeping/seedBrainAndSystems';
import { demoSystems } from '$lib/data/demo/seed/joinery/seedBrainAndSystems';
import { organisationModuleLabels } from '$lib/data/organisationModules';
import { describeDemoTools } from './demoTools';

const switchedOffProduct = 'Your Brain Today';
const brainName = organisationModuleLabels.business_brain;

describe('the demo names the brain the business has in YBT', () => {
	it('never sends a prospect to the switched-off Your Brain Today', () => {
		const everythingTheDemoSays = JSON.stringify([describeDemoTools(), demoSystems, practiceSystems]);

		expect(everythingTheDemoSays).not.toContain(switchedOffProduct);
	});

	it('lists Your Business Brain among the systems of each demo business', () => {
		const systemNames = [...demoSystems, ...practiceSystems].map((system) => system.name);

		expect(systemNames.filter((name) => name === brainName)).toHaveLength(2);
	});
});
