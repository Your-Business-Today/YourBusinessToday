import { describe, expect, it } from 'vitest';
import { contextRunLine } from './contextRunLine';

const membership = { organisationId: 'org-1', accountId: 'account-1', isManager: true };

describe('what get_current_context tells a person on an organisation', () => {
	it('tells them to start a context run of each organisation they are on', () => {
		const line = contextRunLine([membership], () => 'Oak & Ash Joinery');
		expect(line).toContain('run_read_action with start_context_run');
		expect(line).toContain('Oak & Ash Joinery (org-1)');
	});

	it('says nothing to someone on no organisation', () => {
		expect(contextRunLine([], () => '')).toBeNull();
	});
});
