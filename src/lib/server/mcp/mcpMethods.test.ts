import { describe, expect, it, vi } from 'vitest';
import { answerMcpRequest } from './mcpMethods';
import { McpErrorCode } from './mcpErrors';
import {
	showUploadBoxToolName,
	uploadBoxResourceHome,
	uploadBoxStepToolName
} from './uploadBox/uploadBoxNames';
import type { McpCaller } from './resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

type Described = Record<string, any>;
type Answered = { result?: Described; error?: { code: number } };

const caller = { accountId: 'account-1', supabase: {} } as unknown as McpCaller;
const namesEveryObjectInherits = ['constructor', 'toString', 'hasOwnProperty', '__proto__'];
const mcpAppMimeType = 'text/html;profile=mcp-app';
const addressUnderHome = new RegExp(`^${uploadBoxResourceHome}/[0-9a-f]{8}$`);
const reachesOnlyStorage = {
	ui: { csp: { connectDomains: ['https://files.example'] }, prefersBorder: true }
};

async function ask(method: string, params: Record<string, unknown> = {}) {
	const answered: Answered = await answerMcpRequest(caller, { id: 1, method, params });
	const { result = {}, error } = answered;
	return { result, isAnswered: answered.result !== undefined, refusalCode: error?.code };
}

describe('the connector’s methods', () => {
	it('answers only the methods it declares, never a name every object inherits', async () => {
		for (const name of namesEveryObjectInherits) {
			const { isAnswered, refusalCode } = await ask(name);
			expect(isAnswered, name).toBe(false);
			expect(refusalCode, name).toBe(McpErrorCode.MethodNotFound);
		}
	});

	it('says it serves pages as well as tools', async () => {
		const { result } = await ask('initialize', { protocolVersion: '2025-11-25' });
		const servesBoth = { tools: { listChanged: false }, resources: { listChanged: false } };
		expect(result.capabilities).toEqual(servesBoth);
	});

	it('lists the upload box’s two tools: one that draws a page, one for the page alone', async () => {
		const { result } = await ask('tools/list');
		const tools: Described[] = result.tools;
		const showBox = tools.find((tool) => tool.name === showUploadBoxToolName);
		const boxStep = tools.find((tool) => tool.name === uploadBoxStepToolName);
		const page = expect.stringMatching(addressUnderHome);
		const drawsThePage = { resourceUri: page, visibility: ['model', 'app'] };
		expect(showBox).toMatchObject({
			annotations: { readOnlyHint: true },
			_meta: { ui: drawsThePage, 'ui/resourceUri': page }
		});
		expect(boxStep).toMatchObject({ _meta: { ui: { visibility: ['app'] } } });
	});

	it('lists the box’s page at an address marked with its content, asking to reach storage alone', async () => {
		const { result: listed } = await ask('resources/list');
		const { result: templates } = await ask('resources/templates/list');
		const [entry] = listed.resources;
		expect(entry).toMatchObject({ mimeType: mcpAppMimeType, _meta: reachesOnlyStorage });
		expect(entry.uri).toMatch(addressUnderHome);
		expect(templates).toMatchObject({ resourceTemplates: [] });
	});

	it('hands the page over at its address now, and at any it had before it last changed', async () => {
		const { result: listed } = await ask('resources/list');
		const [entry] = listed.resources;
		const earlierAddresses = [uploadBoxResourceHome, `${uploadBoxResourceHome}/0a1b2c3d`];
		for (const address of [entry.uri, ...earlierAddresses]) {
			const { result: read } = await ask('resources/read', { uri: address });
			const [page] = read.contents;
			expect(page, address).toMatchObject({ uri: address, mimeType: mcpAppMimeType });
			expect(page.text, address).toContain('<!doctype html>');
			expect(page._meta, address).toEqual(reachesOnlyStorage);
		}
	});

	it('refuses a page it does not have as a bad request, not as a fault', async () => {
		const unknownPage = await ask('resources/read', { uri: 'ui://your-business-today/nothing' });
		const lookalike = await ask('resources/read', { uri: `${uploadBoxResourceHome}-elsewhere` });
		const noPageNamed = await ask('resources/read');
		expect(unknownPage.refusalCode).toBe(McpErrorCode.InvalidParams);
		expect(lookalike.refusalCode).toBe(McpErrorCode.InvalidParams);
		expect(noPageNamed.refusalCode).toBe(McpErrorCode.InvalidParams);
	});
});
