import { listClients, type ClientSummary } from '$lib/server/clients/listClients';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { stageOnRegister, type SalesRegister } from '$lib/data/salesRegisters';
import type { ClientStage } from '$lib/data/clientLifecycle';

/** A register's records, those at the stage its tab asks for, and how many sit at each of its stages. */
export type SalesRegisterReading = {
	clients: ClientSummary[];
	stage: ClientStage | null;
	stageCounts: Record<ClientStage, number>;
	totalCount: number;
};

const stageParameter = 'stage';

export async function loadSalesRegister(locals: App.Locals, url: URL, register: SalesRegister): Promise<SalesRegisterReading> {
	await requireStaff(locals);
	const stage = stageOnRegister(register, url.searchParams.get(stageParameter));
	const everyRecord = await listClients(locals.supabase, register.stages);
	return {
		clients: everyRecord.filter((client) => stage === null || client.stage === stage),
		stage,
		stageCounts: countByStage(everyRecord),
		totalCount: everyRecord.length
	};
}

function countByStage(clients: ClientSummary[]): Record<ClientStage, number> {
	const counts: Record<ClientStage, number> = { lead: 0, prospect: 0, client: 0, dormant: 0, lost: 0 };
	clients.forEach(({ stage }) => (counts[stage] += 1));
	return counts;
}
