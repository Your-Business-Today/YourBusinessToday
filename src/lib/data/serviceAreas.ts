export type ServiceArea = {
	id: string;
	name: string;
	description: string;
};

export const serviceAreas: ServiceArea[] = [
	{
		id: 'operating-model',
		name: 'AI Operating Model',
		description:
			'Define where AI creates value, how it will be governed and how it will become part of everyday operations.'
	},
	{
		id: 'knowledge-systems',
		name: 'Enterprise Knowledge Systems',
		description:
			'Transform dispersed documents, policies, correspondence and expertise into trusted, accessible organisational intelligence.'
	},
	{
		id: 'workflow-orchestration',
		name: 'Workflow Orchestration',
		description:
			'Connect people, processes and platforms to eliminate manual hand-offs and create consistent end-to-end delivery.'
	},
	{
		id: 'agents-and-assistants',
		name: 'AI Agents and Assistants',
		description:
			'Design task-specific AI agents that retrieve information, prepare outputs, coordinate actions and support teams within defined controls.'
	},
	{
		id: 'document-intelligence',
		name: 'Document Intelligence',
		description:
			'Extract, classify, validate and route information from high-volume documentation—accurately, securely and at scale.'
	},
	{
		id: 'transformation-delivery',
		name: 'Transformation Delivery',
		description:
			'Take priority use cases from discovery through design, implementation, adoption and continuous improvement.'
	},
	{
		id: 'governance-and-control',
		name: 'AI Governance and Control',
		description:
			'Establish the access, approvals, human oversight and auditability needed to deploy AI confidently at scale.'
	}
];
