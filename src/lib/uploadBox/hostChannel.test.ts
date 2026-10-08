import { beforeEach, describe, expect, it, vi } from 'vitest';

type RpcMessage = {
	id?: number;
	method?: string;
	params?: unknown;
	result?: unknown;
	error?: { code: number; message: string };
};
type WindowEvent = { source: unknown; data: unknown };

const methodNotFoundCode = -32601;
const twoMinutesMilliseconds = 120_000;
const stranger = { postMessage: () => {} };

let posted: RpcMessage[] = [];
let hearFromWindow: (event: WindowEvent) => void = () => {};
const host = { postMessage: (message: RpcMessage) => posted.push(message) };

function hostSays(message: RpcMessage, source: unknown = host) {
	hearFromWindow({ source, data: { jsonrpc: '2.0', ...message } });
}

async function freshChannel() {
	vi.resetModules();
	const channel = await import('./hostChannel.js');
	channel.listenToHost();
	return channel;
}

describe('the channel between the upload box and its host', () => {
	beforeEach(() => {
		posted = [];
		vi.useRealTimers();
		vi.stubGlobal('window', {
			parent: host,
			addEventListener: (_kind: string, listener: typeof hearFromWindow) => {
				hearFromWindow = listener;
			}
		});
	});

	it('asks the host and hands back its answer', async () => {
		const { askHost } = await freshChannel();
		const asked = askHost('tools/call', { name: 'perform_upload_box_step' });
		const [request] = posted;
		expect(request).toMatchObject({ jsonrpc: '2.0', id: 1, method: 'tools/call' });
		hostSays({ id: request.id, result: { isError: false } });
		expect(await asked).toEqual({ isError: false });
	});

	it('fails a request the host answers with an error', async () => {
		const { askHost } = await freshChannel();
		const asked = askHost('ui/open-link', { url: 'https://yourbusiness.today' });
		const refusal = { code: -32000, message: 'Link opening denied by user' };
		hostSays({ id: posted[0].id, error: refusal });
		await expect(asked).rejects.toThrow(refusal.message);
	});

	it('stops waiting for a host that never answers', async () => {
		vi.useFakeTimers();
		const { askHost } = await freshChannel();
		const givenUp = expect(askHost('tools/call', {})).rejects.toThrow('The host did not answer.');
		vi.advanceTimersByTime(twoMinutesMilliseconds);
		await givenUp;
	});

	it('hands a notification to whoever asked to hear it, and drops the rest', async () => {
		const { onHostNotification } = await freshChannel();
		const heard: unknown[] = [];
		const toolInput = { arguments: { taskId: 'task-1' } };
		onHostNotification('ui/notifications/tool-input', (params) => heard.push(params));
		hostSays({ method: 'ui/notifications/tool-input', params: toolInput });
		hostSays({ method: 'ui/notifications/tool-cancelled', params: {} });
		expect(heard).toEqual([toolInput]);
	});

	it('answers what a host asks of it, and says so when it does not know the request', async () => {
		await freshChannel();
		hostSays({ id: 7, method: 'ping' });
		hostSays({ id: 8, method: 'ui/resource-teardown', params: {} });
		hostSays({ id: 9, method: 'tools/list' });
		expect(posted).toMatchObject([
			{ id: 7, result: {} },
			{ id: 8, result: {} },
			{ id: 9, error: { code: methodNotFoundCode } }
		]);
	});

	it('takes no answer from anywhere but its host', async () => {
		const { askHost } = await freshChannel();
		const answers: unknown[] = [];
		askHost('tools/call', {}).then((answer) => answers.push(answer));
		hostSays({ id: 1, result: { from: 'a stranger' } }, stranger);
		hostSays({ id: 1, result: { from: 'the host' } });
		await Promise.resolve();
		expect(answers).toEqual([{ from: 'the host' }]);
	});
});
