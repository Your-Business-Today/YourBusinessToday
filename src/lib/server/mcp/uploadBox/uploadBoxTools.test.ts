import { describe, expect, it, vi } from 'vitest';
import { noSuchTask } from '../actions/describeTask';
import { uploadBoxOutcomes } from './uploadBoxOutcomes';
import { uploadBoxTools } from './uploadBoxTools';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

/** A caller with no database behind it: a door that let a bad request through would fail on it, loudly. */
const caller = { accountId: 'account-1', supabase: {} } as unknown as McpCaller;
const taskId = '1fb44eba-7319-4c37-9e4e-ea1f77a1f88a';
const namesNoStepHas = ['constructor', 'toString', '__proto__', 'sweep', ''];
const malformedTaskIds = ['', 'task-1', `${taskId}'; drop table tasks; --`];
const [showBox, boxStep] = uploadBoxTools;
const refused = { data: { outcome: uploadBoxOutcomes.refused } };

describe('the upload box’s two tools, at the door', () => {
	it('takes only the steps the box has, never a name every object inherits', async () => {
		for (const step of namesNoStepHas) {
			expect(await boxStep.run(caller, { taskId, step }), step).toMatchObject(refused);
		}
	});

	it('refuses a task id that is not one before anything is looked up', async () => {
		for (const malformedTaskId of malformedTaskIds) {
			const asked = { taskId: malformedTaskId, step: 'open' };
			expect(await boxStep.run(caller, asked), malformedTaskId).toMatchObject(refused);
			expect(await showBox.run(caller, { taskId: malformedTaskId }), malformedTaskId).toBe(noSuchTask);
		}
	});

	it('tells the model the step tool is the box’s own, and where to go instead', () => {
		expect(boxStep.description).toContain('never by you');
		expect(boxStep.description).toContain(showBox.name);
	});
});
