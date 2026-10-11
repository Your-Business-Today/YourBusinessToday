export type HarnessTable = {
	name: string;
	columns: string[];
};

export type HarnessDoor = {
	id: string;
	name: string;
	description: string;
};

export const dataSourceExamples: string[] = [
	'Quote spreadsheet',
	'Job sheet in Word',
	'Site photographs',
	'Emails agreeing a change',
	'Invoice template',
	'Timesheets'
];

export const harnessTables: HarnessTable[] = [
	{ name: 'projects', columns: ['client', 'address', 'stage'] },
	{ name: 'jobs', columns: ['project', 'trade', 'agreed price'] },
	{ name: 'invoices', columns: ['job', 'amount', 'due date'] },
	{ name: 'documents', columns: ['project', 'kind', 'received'] }
];

export const agentSkillExamples: string[] = [
	'Put together the monthly valuation',
	'Write the client report from the week on site',
	'Chase the invoices that are late',
	'Sort what arrived this morning'
];

export const harnessDoors: HarnessDoor[] = [
	{
		id: 'dashboards',
		name: 'Dashboards',
		description: 'A screen for each thing and a view for each question like any software.'
	},
	{
		id: 'mcp',
		name: 'Your AI assistant',
		description: 'The same actions as the screens performed from inside Claude or ChatGPT.'
	}
];

export const roleBasedAccessLine =
	'One set of roles on both. What a person may see or do on the screen is exactly what their assistant may see or do.';
