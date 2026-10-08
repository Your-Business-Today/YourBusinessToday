/**
 * @typedef {{ code: number, message: string }} RpcFailure
 * @typedef {{ id?: number | string, method?: string, params?: any, result?: any, error?: RpcFailure }} RpcMessage
 * @typedef {{ resolve: (result: any) => void, reject: (failure: Error) => void }} WaitingRequest
 */

const jsonRpcVersion = '2.0';
const methodNotFoundCode = -32601;
const requestTimedOutCode = -32001;
const everyOrigin = '*';
const requestsTheBoxAnswers = ['ui/resource-teardown', 'ping'];
const longestWaitMilliseconds = 120_000;
const hostDidNotAnswer = { code: requestTimedOutCode, message: 'The host did not answer.' };

let nextRequestId = 1;
/** @type {Map<number | string, WaitingRequest>} */
const waitingRequests = new Map();
/** @type {Map<string, (params: any) => void>} */
const notificationHandlers = new Map();

/** @param {RpcMessage} message */
function post(message) {
	window.parent.postMessage({ jsonrpc: jsonRpcVersion, ...message }, everyOrigin);
}

/**
 * Asks the host for something and waits for its answer, though not for ever.
 * @param {string} method
 * @param {Record<string, unknown>} params
 * @returns {Promise<any>}
 */
export function askHost(method, params) {
	const id = nextRequestId;
	nextRequestId += 1;
	return new Promise((resolve, reject) => {
		waitingRequests.set(id, { resolve, reject });
		setTimeout(() => settleRequest({ id, error: hostDidNotAnswer }), longestWaitMilliseconds);
		post({ id, method, params });
	});
}

/**
 * @param {string} method
 * @param {Record<string, unknown>} params
 */
export function tellHost(method, params) {
	post({ method, params });
}

/**
 * @param {string} method
 * @param {(params: any) => void} handler
 */
export function onHostNotification(method, handler) {
	notificationHandlers.set(method, handler);
}

export function listenToHost() {
	window.addEventListener('message', receiveFromHost);
}

/** @param {MessageEvent} event */
function receiveFromHost(event) {
	const message = event.data;
	if (event.source !== window.parent || message?.jsonrpc !== jsonRpcVersion) return;
	if (message.method === undefined) {
		settleRequest(message);
		return;
	}
	if (message.id === undefined) {
		const handler = notificationHandlers.get(message.method);
		handler?.(message.params ?? {});
		return;
	}
	answerHostRequest(message);
}

/** @param {RpcMessage} message */
function settleRequest(message) {
	const waiting = waitingRequests.get(message.id ?? '');
	if (waiting === undefined) return;
	waitingRequests.delete(message.id ?? '');
	if (message.error !== undefined) {
		waiting.reject(new Error(message.error.message));
		return;
	}
	waiting.resolve(message.result ?? {});
}

/** @param {RpcMessage} message */
function answerHostRequest(message) {
	if (requestsTheBoxAnswers.includes(message.method ?? '')) {
		post({ id: message.id, result: {} });
		return;
	}
	const unknownMethod = { code: methodNotFoundCode, message: `Unknown method ${message.method}` };
	post({ id: message.id, error: unknownMethod });
}
