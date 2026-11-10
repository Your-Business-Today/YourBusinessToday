import { moduleAction } from '../organisationModuleGate';
import { readPerformance, recordPerformance } from './brandPerformanceRuns';
import { readPerformanceSchema, recordPerformanceSchema } from './brandPerformanceSchemas';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** The connector actions on how a brand's pieces and campaigns performed: record readings, and read them back. */
export const brandPerformanceActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'record_performance',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'record how the brand’s pieces and campaigns performed: views, watch time, engagement, clicks, conversions, spend',
		guidance:
			'Record the figures exactly as the platform reports them, one reading per piece or campaign, medium and day. ' +
			'Every figure is a count of zero or more, and spend is in pounds. A reading that does not fit is refused by name ' +
			'and the others in the same call are still recorded. A reading already held for that day is not added again.',
		inputSchema: recordPerformanceSchema,
		run: recordPerformance
	}),
	moduleAction(brandModule, {
		name: 'read_performance',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'how the brand has performed since a day, medium by medium, with a total',
		guidance: 'When a pattern shows, such as a behaviour or a look that does better, propose it with record_brand_decisions.',
		inputSchema: readPerformanceSchema,
		run: readPerformance
	})
];
