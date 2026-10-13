import { describe, expect, it } from 'vitest';
import { portalTaskStatusLabel } from './portalTaskStatus';

describe('portalTaskStatusLabel', () => {
	it('calls work waiting its turn planned', () => {
		expect(portalTaskStatusLabel('work', 'backlog')).toBe('Planned');
		expect(portalTaskStatusLabel('work', 'in_progress')).toBe('In progress');
	});

	it('keeps the words a support request already speaks to its client in', () => {
		expect(portalTaskStatusLabel('support', 'backlog')).toBe('Awaiting answer');
		expect(portalTaskStatusLabel('support', 'done')).toBe('Resolved');
	});
});
