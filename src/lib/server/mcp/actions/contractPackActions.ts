import { prepareContractPack } from '$lib/server/contractPacks/prepareContractPack';
import { readContractPack } from '$lib/server/contractPacks/readContractPack';
import { validateContractPackRequest } from '$lib/server/contractPacks/validateContractPackRequest';
import { validateRecordId } from '$lib/data/isUuid';
import { contractPackLimits } from '$lib/data/contractPackRules';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { describeContractPack } from './describeContractPack';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const packGuidance =
	"A client's contract pack is the contract templates filled for one client organisation: its legal name, company " +
	"number, registered office, signatory and notices email from the organisation's details, the fees from the latest " +
	'version of its quote, and any blank written in, with the optional clauses chosen for this client. Each document is ' +
	'kept on the organisation as a draft, so every version is kept and the template never changes. Fill the organisation ' +
	'details first (update_organisation_details) and file the quote (file_lead_quote), then prepare on the person\'s yes. ' +
	'A blank nobody knows yet stays in its brackets, and read_contract_pack lists those still open.';

const slugList = (description: string) => ({ type: 'array', items: { type: 'string' }, description });

const fields = {
	organisationId: textField("The client organisation's id, as list_organisations gives it"),
	packId: textField('A pack id, as read_contract_pack gives it; leave out for the latest pack'),
	documents: slugList(
		'The contract documents in the pack, by slug, in the order they are read; leave out for all of them (list_client_documents)'
	),
	clauses: slugList(
		'The optional clauses chosen, by slug; leave out for the ones chosen unless left out (read_client_document lists each)'
	),
	values: {
		type: 'object',
		additionalProperties: { type: 'string', maxLength: contractPackLimits.longestBlankValue },
		description:
			'Blanks written into the pack, each label as it stands in its brackets with the text it is filled with, such as ' +
			'{"Order number": "YBT-0001", "Start date": "1 December 2026"}. A value given here wins over the organisation\'s ' +
			"details and the quote. Any blank still unknown stays in its brackets, to be filled later."
	}
};

const noPackYet = 'has no contract pack yet: prepare_contract_pack makes one.';

export const contractPackActions: McpAction[] = [
	{
		name: 'prepare_contract_pack',
		area: 'clients',
		audience: 'admin',
		isWrite: true,
		summary: "prepare a client's contract pack: each chosen contract document filled with the client's details and quote, kept on their organisation as a draft",
		guidance: packGuidance,
		inputSchema: objectSchema(
			{ organisationId: fields.organisationId, documents: fields.documents, clauses: fields.clauses, values: fields.values },
			['organisationId']
		),
		run: async (caller, input) => preparePack(caller, input)
	},
	{
		name: 'read_contract_pack',
		area: 'clients',
		audience: 'admin',
		isWrite: false,
		summary: "read a client's contract pack: where it stands, the clauses chosen, and each document with the blanks still open",
		guidance: packGuidance,
		inputSchema: objectSchema({ organisationId: fields.organisationId, packId: fields.packId }, ['organisationId']),
		run: async (caller, input) => readPack(caller, input)
	}
];

async function preparePack(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const request = validateContractPackRequest(input);
	if (typeof request === 'string') return request;
	const organisation = await reachableOrganisation(caller, request.organisationId);
	if (organisation === null) return noSuchOrganisation;
	const preparer = { supabase: caller.supabase, accountId: caller.accountId, organisation };
	const packId = await prepareContractPack(preparer, request);
	const pack = await readContractPack(caller.supabase, organisation.id, packId);
	if (pack === null) return `Prepared the pack (id: ${packId}); read_contract_pack reads it.`;
	return `Prepared.\n${describeContractPack(organisation.name, pack)}`;
}

async function readPack(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisationId = readText(input, 'organisationId');
	const packId = readOptionalText(input, 'packId');
	const idRefusal = validateRecordId('organisationId', organisationId) ?? validatePackId(packId);
	if (idRefusal !== null) return idRefusal;
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null) return noSuchOrganisation;
	const pack = await readContractPack(caller.supabase, organisation.id, packId);
	if (pack === null) return `${organisation.name} ${noPackYet}`;
	return describeContractPack(organisation.name, pack);
}

function validatePackId(packId: string | null): string | null {
	if (packId === null) return null;
	return validateRecordId('packId', packId);
}
