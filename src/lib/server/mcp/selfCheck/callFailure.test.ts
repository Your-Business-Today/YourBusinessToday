import { describe, expect, it } from 'vitest';
import { failureOfAnswer, failureOfThrow } from './callFailure';

describe('the failure of one call on the connector', () => {
	it('is nothing when the call answered', () => {
		const answer = { result: { isError: false, content: [{ type: 'text', text: 'Your projects:' }] } };
		expect(failureOfAnswer('list_actions', answer)).toBeNull();
	});

	it('names the call and what its caller would be told when the tool failed', () => {
		const answer = { result: { isError: true, content: [{ type: 'text', text: 'That did not work.' }] } };
		expect(failureOfAnswer('run_read_action read_project', answer)).toBe(
			'run_read_action read_project failed: That did not work.'
		);
	});

	it('says so when the request itself was refused', () => {
		const answer = { error: { code: -32601, message: 'Unknown method tools/call' } };
		expect(failureOfAnswer('list_actions', answer)).toBe('list_actions was refused: Unknown method tools/call');
	});

	it('names a call that threw instead of answering', () => {
		expect(failureOfThrow('get_current_context', new Error('connection reset'))).toBe(
			'get_current_context threw: connection reset'
		);
	});
});
