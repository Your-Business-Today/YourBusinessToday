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
			'We look at everything that comes into your business and everything that goes out. We map the processes that turn one into the other.'
	},
	{
		id: 'harness',
		name: 'Creating your data harness',
		description:
			'We build one secure place for all of your data. Every person sees what their role allows and nothing more.'
	},
	{
		id: 'skills',
		name: 'Teaching your assistant skills',
		description:
			'We write the skills your AI assistant needs to run your processes. You can add to them and change them yourself through the connector.'
	},
	{
		id: 'dashboards',
		name: 'Viewing information',
		description:
			'We give you a web app over your data. New screens can be asked for in a chat and built without touching the data underneath.'
	},
	{
		id: 'mcp',
		name: 'Accessing information',
		description:
			'We connect your AI assistant to the same system. It can do everything the web app can do from a chat window instead of a screen.'
	},
	{
		id: 'projects',
		name: 'Running your project',
		description:
			'Your work lives in our project management system. You see every goal and task and talk to us on each one. Your own AI assistant can read it and raise work for you.'
	},
	{
		id: 'management',
		name: 'Future maintenance',
		description: 'We stay on everything we build. It is not a handover and a goodbye.'
	}
];
