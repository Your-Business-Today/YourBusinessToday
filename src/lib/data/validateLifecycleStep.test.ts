import { describe, expect, it } from 'vitest';
import { validateLifecycleStep, type LifecycleStepFields } from './validateLifecycleStep';

const building: LifecycleStepFields = {
	step: 'building',
	outcome: '',
	agent: 'Claude cloud session',
	model: 'claude-opus',
	runUrl: '',
	branchName: 'feature/autocomplete-flag',
	note: ''
};

describe('validateLifecycleStep', () => {
	it('accepts a step within its columns', () => {
		expect(validateLifecycleStep(building)).toMatchObject({ step: 'building' });
	});

	it('refuses a step that is not on the lifecycle', () => {
		expect(validateLifecycleStep({ ...building, step: 'thinking' })).toContain('step is one of');
	});

	it('asks for an outcome when the step is considered', () => {
		expect(validateLifecycleStep({ ...building, step: 'considered' })).toContain('outcome');
	});

	it('refuses a note longer than its column rather than cutting it', () => {
		expect(validateLifecycleStep({ ...building, note: 'x'.repeat(2001) })).toBe('note is at most 2000 characters.');
	});
});
