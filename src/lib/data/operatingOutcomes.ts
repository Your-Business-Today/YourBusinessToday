export type OperatingOutcome = {
	id: string;
	name: string;
	description: string;
};

export const operatingOutcomes: OperatingOutcome[] = [
	{
		id: 'connected-knowledge',
		name: 'Connected knowledge',
		description:
			'Make organisational expertise, documents, records and processes accessible and usable.'
	},
	{
		id: 'intelligent-workflows',
		name: 'Intelligent workflows',
		description: 'Automate repetitive, document-heavy and multi-stage operational work.'
	},
	{
		id: 'ai-enabled-teams',
		name: 'AI-enabled teams',
		description:
			'Give people context-aware assistance within the systems and channels where they already work.'
	},
	{
		id: 'operational-control',
		name: 'Operational control',
		description:
			'Create visibility, consistency, accountability and an audit trail across critical processes.'
	},
	{
		id: 'scalable-capability',
		name: 'Scalable capability',
		description:
			'Build reusable foundations that can expand from a priority workflow to enterprise-wide transformation.'
	}
];
