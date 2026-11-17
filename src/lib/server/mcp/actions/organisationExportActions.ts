import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { exportOrganisationData } from '$lib/server/organisationExport/exportOrganisationData';
import { findOrganisationExports } from '$lib/server/organisationExport/organisationExportRecord';
import { exportedSentence } from '$lib/data/organisationExport/exportedSentence';
import { describeOrganisationExports } from './describeOrganisationExports';
import { manageableOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const exportInput = objectSchema({ organisationId: organisationIdField }, ['organisationId']);

export const organisationExportActions: McpAction[] = [
	{
		name: 'export_organisation_data',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary:
			'export everything an organisation you manage keeps in Your Business Today: a CSV of every table of its Books, ' +
			'Your Business Brain, Boardroom, Brand and workflow map, and every stored file in its original format, as one ' +
			'or more zips with a download link each, lasting an hour; the export is logged',
		guidance:
			'Give the person the links as they are. A large export comes as several zips, which together hold everything. ' +
			'Records a company portal keeps are exported from that portal, on its Data protection page.',
		inputSchema: exportInput,
		run: exportForCaller
	},
	{
		name: 'list_organisation_data_exports',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary: 'the log of an organisation’s data exports, newest first: when, by whom, and what each held',
		inputSchema: exportInput,
		run: listForCaller
	}
];

async function exportForCaller(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
	if (organisation === null) return notAnOrganisationManager;
	const finished = await exportOrganisationData(caller.supabase, organisation, caller.accountId);
	const links = finished.partLinks.map((link, index) => `${index + 1}. ${link}`);
	return [exportedSentence(organisation.name, finished), '', ...links].join('\n');
}

async function listForCaller(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
	if (organisation === null) return notAnOrganisationManager;
	const exports = await findOrganisationExports(caller.supabase, organisation.id);
	const exporterIds = [...new Set(exports.flatMap((record) => (record.exportedBy === null ? [] : [record.exportedBy])))];
	const exporters = await getAccountsById(caller.supabase, exporterIds);
	const exporterNames = new Map(exporters.map((account) => [account.id, account.name]));
	return describeOrganisationExports(organisation.name, exports, exporterNames);
}
