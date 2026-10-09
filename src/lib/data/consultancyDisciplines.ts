export type ConsultancyDiscipline = {
	id: string;
	name: string;
	description: string;
};

export const consultancyDisciplines: ConsultancyDiscipline[] = [
	{
		id: 'discovery',
		name: 'Mapping your data sources',
		description:
			'We analyse all input sources to your business and map out your business domain. We identify all the outputs created from the input sources, along with the processes that created them.'
	},
	{
		id: 'harness',
		name: 'Creating your data harness',
		description:
			'We build you a fully secure, role-based data harness that allows you to manage access to your data.'
	},
	{
		id: 'skills',
		name: 'Teaching agents skills',
		description:
			"We give you a fully customisable agent skill layer that you can train yourself using the system's MCP connector. This allows you to fully control how your system is used by language models."
	},
	{
		id: 'dashboards',
		name: 'Viewing information',
		description:
			'We give you a fully customisable web-based UI which can be updated automatically in a chat window using the YBT MCP connector. This allows you to iterate UI features quickly without affecting the underlying data security.'
	},
	{
		id: 'mcp',
		name: 'Accessing information',
		description:
			'We build you an MCP server that mirrors the functionality of the web-based application that manages your data harness.'
	},
	{
		id: 'management',
		name: 'Future maintenance',
		description:
			'We stay on the harness, the skills and the doors we build. Not a handover and a goodbye.'
	}
];
