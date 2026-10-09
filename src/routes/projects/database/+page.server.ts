import { fail } from '@sveltejs/kit';
import { accountNameLookup } from '$lib/data/accountNames';
import { confirmDatabaseTaskRun, runConfirmations } from '$lib/server/databaseTasks/confirmDatabaseTaskRun';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getDatabaseTaskRegister } from '$lib/server/databaseTasks/getDatabaseTaskRegister';
import { migrationNameOf } from '$lib/data/migrationFiles';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateDatabaseTaskConfirmation } from '$lib/data/validateDatabaseTaskConfirmation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	const register = await getDatabaseTaskRegister(locals.supabase);
	const runnerIds = register.recentlyRun.flatMap((task) => (task.runByAccountId === null ? [] : [task.runByAccountId]));
	const nameOf = accountNameLookup(await getAccountsById(locals.supabase, runnerIds));
	const runnerNames = Object.fromEntries(runnerIds.map((accountId) => [accountId, nameOf(accountId)]));
	return { register, runnerNames };
};

export const actions: Actions = {
	confirmRun: async ({ locals, request }) => {
		await requireAdmin(locals);
		const user = await requireUser(locals);
		const formData = await request.formData();
		const taskId = String(formData.get('databaseTaskId') ?? '');
		const problem = validateDatabaseTaskConfirmation(taskId);
		if (problem !== null) return fail(400, { message: problem });
		const confirmation = await confirmDatabaseTaskRun(locals.supabase, taskId, user.id);
		if (confirmation.kind === runConfirmations.noSuchTask) return fail(404, { message: 'No such database task.' });
		const { task } = confirmation;
		const name = migrationNameOf(task.filePath);
		if (confirmation.kind === runConfirmations.alreadyRun) return { message: `${name} was already confirmed as run.` };
		return { message: `${name} confirmed as run on ${task.projectName}.` };
	}
};
