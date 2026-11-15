import { describe, expect, it } from 'vitest';
import { workingDoctrine } from './workingDoctrine';
import { todoWriteActions } from './actions/todoWriteActions';
import { taskWriteActions } from './actions/taskWriteActions';
import { dayToDayDataRule } from './ownerDoctrine';

function guidanceOf(actions: { name: string; guidance?: string }[], name: string): string {
	const action = actions.find((candidate) => candidate.name === name);
	return action?.guidance ?? '';
}

describe('the owner’s standing rules in the working doctrine', () => {
	it('keeps day-to-day data and small company jobs on the doer’s own to-do list', () => {
		expect(workingDoctrine).toContain(dayToDayDataRule);
		expect(guidanceOf(todoWriteActions, 'add_todo')).toContain(dayToDayDataRule);
		expect(guidanceOf(taskWriteActions, 'create_task')).toContain(dayToDayDataRule);
	});

	it('starts what a Claude can do, generates in the asker’s Claude and keeps setup off one account', () => {
		expect(workingDoctrine).toContain('Never ask whether what is done is enough');
		expect(workingDoctrine).toContain('without asking, and say what went');
		expect(workingDoctrine).toContain('Never run that work on GitHub');
		expect(workingDoctrine).toContain('A status summary leaves out done work');
		expect(workingDoctrine).toContain('never in one Claude account');
	});

	it('says territory, never patch', () => {
		expect(workingDoctrine).toContain('a territory, never a patch');
	});
});
