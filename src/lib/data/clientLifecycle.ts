export type ClientStage = 'lead' | 'prospect' | 'client' | 'dormant' | 'lost';

export const clientStageOrder: ClientStage[] = ['lead', 'prospect', 'client', 'dormant', 'lost'];

export const clientStageLabels: Record<ClientStage, string> = {
	lead: 'Lead',
	prospect: 'Prospect',
	client: 'Client',
	dormant: 'Dormant',
	lost: 'Lost'
};

export function parseClientStage(value: unknown): ClientStage {
	const stage = clientStageOrder.find((candidate) => candidate === value);
	if (stage === undefined) return 'lead';
	return stage;
}

/** Why the value cannot be a client's lifecycle_stage, or null when it is one of the stages the column allows. */
export function validateClientStage(value: string): string | null {
	const isKnownStage = clientStageOrder.some((candidate) => candidate === value);
	if (isKnownStage) return null;
	return `There is no ${value} stage. Use one of: ${clientStageOrder.join(', ')}.`;
}
