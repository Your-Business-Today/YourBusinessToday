import { clientsRegister } from '$lib/data/salesRegisters';
import { loadSalesRegister } from '$lib/server/salesRegisters/loadSalesRegister';
import { deleteFromRegisterAction } from '$lib/server/salesRegisters/deleteFromRegisterAction';
import { moveStageAction } from '$lib/server/salesRegisters/moveStageAction';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	const { framePicks } = await parent();
	return loadSalesRegister(locals, url, clientsRegister, framePicks);
};

export const actions: Actions = {
	moveStage: moveStageAction,
	deleteFromRegister: deleteFromRegisterAction
};
