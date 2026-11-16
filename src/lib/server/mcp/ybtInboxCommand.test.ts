import { describe, expect, it } from 'vitest';
import { emailOwnerActions } from './actions/emailOwnerActions';
import { filedEmailActions } from './actions/filedEmailActions';
import { inboxTriageActions } from './actions/inboxTriageActions';
import { getMcpPrompt } from './mcpPrompts';
import { inboxCommand } from './ybtInboxCommand';

const actionName = /\b[a-z]+(?:_[a-z]+)+\b/g;
const triageInOrder = ['read_inbox_triage', 'find_records_for_email', 'file_email_to_client', 'list_actions', 'record_triage_decision'];
const connectorTools = ['list_actions'];

describe('/ybt-inbox', () => {
	const { text } = inboxCommand;

	it('is offered as a prompt of its own', () => {
		const { messages } = getMcpPrompt('ybt-inbox') as { messages: { content: { text: string } }[] };
		const [{ content }] = messages;
		expect(content.text).toBe(text);
	});

	it('names the actions of a triage run in the order they are used, and no other', () => {
		expect(text.match(actionName)).toEqual(triageInOrder);
	});

	it('names only actions the connector offers', () => {
		const offered = [...inboxTriageActions, ...emailOwnerActions, ...filedEmailActions].map((action) => action.name);
		const actions = triageInOrder.filter((name) => !connectorTools.includes(name));
		for (const name of actions) expect(offered, name).toContain(name);
	});

	it('stops when Gmail is not connected, sends nothing and asks only about what is unclear', () => {
		expect(text).toContain('if you have no Gmail tools, say so in one sentence and stop');
		expect(text).toContain('Never send or draft a reply during triage');
		expect(text).toContain('Ask me only about an email whose client or lead is not clear, one at a time');
		expect(text).toContain('YBT/Triaged');
	});
});
