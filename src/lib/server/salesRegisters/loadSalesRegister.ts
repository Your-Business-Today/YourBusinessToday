import { listClientsKeptBy, type ClientSummary } from '$lib/server/clients/listClients';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { stageOnRegister, type SalesRegister } from '$lib/data/salesRegisters';
import type { ClientStage } from '$lib/data/clientLifecycle';
import type { FramePicks } from '$lib/components/frame/framePicks';
import type { StaffMember } from '$lib/server/projects/getStaffDirectory';
import { loadOrganisationSalespeople } from '$lib/server/salesPeople/loadOrganisationSalespeople';
import { requireSalesSwitchedOn } from '$lib/server/salesPeople/requireSalesSwitchedOn';

/** A register's records, those at the stage its tab asks for, how many sit at each of its stages, and the staff who bring them in. */
export type SalesRegisterReading = {
	clients: ClientSummary[];
	stage: ClientStage | null;
	stageCounts: Record<ClientStage, number>;
	totalCount: number;
	staffMembers: StaffMember[];
	viewerId: string;
};

const stageParameter = 'stage';

/** The picked organisation's register; with no organisation picked there is no register to read. */
export async function loadSalesRegister(
	locals: App.Locals,
	url: URL,
	register: SalesRegister,
	framePicks: FramePicks | null
): Promise<SalesRegisterReading> {
	const viewer = await requireStaff(locals);
	const stage = stageOnRegister(register, url.searchParams.get(stageParameter));
	const pickedOrganisationId = framePicks?.pickedOrganisationId ?? null;
	const everyRecord = await recordsKeptBy(locals, pickedOrganisationId, register);
	const staffMembers = await salespeopleFor(locals, pickedOrganisationId, everyRecord);
	return {
		clients: everyRecord.filter((client) => stage === null || client.stage === stage),
		stage,
		stageCounts: countByStage(everyRecord),
		totalCount: everyRecord.length,
		staffMembers,
		viewerId: viewer.id
	};
}

async function recordsKeptBy(
	locals: App.Locals,
	organisationId: string | null,
	register: SalesRegister
): Promise<ClientSummary[]> {
	if (organisationId === null) return [];
	await requireSalesSwitchedOn(locals, organisationId);
	return listClientsKeptBy(locals.supabase, organisationId, register.stages);
}

async function salespeopleFor(locals: App.Locals, organisationId: string | null, records: ClientSummary[]): Promise<StaffMember[]> {
	if (organisationId === null) return [];
	return loadOrganisationSalespeople(locals.supabase, organisationId, records.map(({ ownerId }) => ownerId));
}

function countByStage(clients: ClientSummary[]): Record<ClientStage, number> {
	const counts: Record<ClientStage, number> = { lead: 0, prospect: 0, client: 0, dormant: 0, lost: 0 };
	clients.forEach(({ stage }) => (counts[stage] += 1));
	return counts;
}
