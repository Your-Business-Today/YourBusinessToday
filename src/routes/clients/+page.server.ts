import { clientsRegister } from '$lib/data/salesRegisters';
import { loadSalesRegister } from '$lib/server/salesRegisters/loadSalesRegister';
import { moveStageAction } from '$lib/server/salesRegisters/moveStageAction';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => loadSalesRegister(locals, url, clientsRegister);

export const actions: Actions = {
	moveStage: moveStageAction
};
