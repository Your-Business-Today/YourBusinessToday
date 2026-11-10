import { describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { actionsFor } from './actionRegistry';
import { describeMcpTools } from './mcpTools';
import contract from './pipelineContract.json';
import { breachesOf, reroutedActionsOf } from './pipelineContractBreaches';
import type { ContractedAction, ContractedCall, OfferedCall } from './pipelineContractBreaches';
import type { AccountStanding } from './resolveAccountStanding';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const repositoryRoot = join(import.meta.dirname, '../../../..');
const skillsDirectory = '.claude/skills';
const nameInBackticks = /`([a-z]+(?:_[a-z0-9]+)+)`/g;
const contractedTools: Record<string, ContractedCall> = contract.tools;
const contractedActions: Record<string, ContractedAction> = contract.actions;
const someoneWhoIsNotStaff = { isAdmin: false, isStaff: false } as AccountStanding;
const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;

const whatABreachCallsFor =
	'This breaks a call the build pipeline makes, as pipelineContract.json records it. Keep the promised name, ' +
	'input or value working. When the break is meant, change the instructions that make the call in every ' +
	'repository that carries them, and the contract with them';

const whereToRecordAName =
	'pipelineContract.json accounts for every name the instructions call or pass, and these are missing. Record ' +
	'each there: under actions or tools with its inputs when the connector serves it, under the values of the ' +
	'action input that takes it when a session passes it, or under namesFromElsewhere with what it is';

const whereAServedCallGoes = 'The connector serves these, so each goes under actions or tools with its inputs';

function instructionFiles(): string[] {
	const skillFiles = readdirSync(join(repositoryRoot, skillsDirectory), { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.md'))
		.map((file) => join(skillsDirectory, file));
	return ['CLAUDE.md', 'PROJECT.md', ...skillFiles];
}

function namesCalledIn(file: string): string[] {
	const instructions = readFileSync(join(repositoryRoot, file), 'utf8');
	return [...new Set([...instructions.matchAll(nameInBackticks)].map((match) => match[1]))];
}

function namesTheContractAccountsFor(): Set<string> {
	const promisedValues = Object.values(contractedActions).flatMap((action) => Object.values(action.values ?? {}));
	return new Set([
		...Object.keys(contractedTools),
		...Object.keys(contractedActions),
		...promisedValues.flat(),
		...Object.keys(contract.namesFromElsewhere)
	]);
}

function namesNotAccountedFor(): string[] {
	const accountedNames = namesTheContractAccountsFor();
	return instructionFiles().flatMap((file) =>
		namesCalledIn(file)
			.filter((name) => !accountedNames.has(name))
			.map((name) => `${file} names ${name}`)
	);
}

describe('the pipeline contract', () => {
	const offeredTools = describeMcpTools() as OfferedCall[];
	const offeredActions = actionsFor(someoneWhoIsNotStaff, null);

	it('accounts for every name the repository tells a session to call or pass', () => {
		expect(namesNotAccountedFor(), whereToRecordAName).toEqual([]);
	});

	it('files no call the connector serves under the names from elsewhere', () => {
		const servedNames = [...offeredTools, ...actionsFor(anAdministrator, null)].map((call) => call.name);
		const parkedCalls = Object.keys(contract.namesFromElsewhere).filter((name) => servedNames.includes(name));
		expect(parkedCalls, whereAServedCallGoes).toEqual([]);
	});

	it('is still honoured by every tool the connector serves', () => {
		expect(breachesOf(contractedTools, offeredTools), whatABreachCallsFor).toEqual([]);
	});

	it('is still honoured by every action the pipeline calls, for someone who is not staff', () => {
		expect(breachesOf(contractedActions, offeredActions), whatABreachCallsFor).toEqual([]);
	});

	it('still runs every action through the tool the pipeline calls it on', () => {
		expect(reroutedActionsOf(contractedActions, offeredActions), whatABreachCallsFor).toEqual([]);
	});
});
