import { error, fail, type Action } from '@sveltejs/kit';
import { billingFormFields, readPostedPause, readPostedSchedule } from '$lib/data/books/billingScheduleFormField';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { changeOrganisationBilling, pauseOrganisationBilling, setUpOrganisationBilling } from './organisationBillingWrites';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const onlyStaffSetBilling = 'Only Your Business Today staff set what an organisation is billed.';

const badRequest = 400;

const forbidden = 403;

async function requireStaffAt(locals: App.Locals, organisationId: string): Promise<Organisation> {
	const { organisation, isStaff } = await requireOrganisationAccess(locals, organisationId);
	if (!isStaff) error(forbidden, onlyStaffSetBilling);
	return organisation;
}

/** Saves, or hands the books' refusal back to the form by name; any other failure is the server's. */
async function savedOrRefused(save: () => Promise<unknown>, savedMessage: string) {
	try {
		await save();
		return { message: savedMessage };
	} catch (failure) {
		if (failure instanceof BooksRefusal) return fail(badRequest, { message: failure.message });
		throw failure;
	}
}

/** The Billing tab's form actions on an organisation's overview: staff only, each the same step as its connector action. */
export const organisationBillingActions = {
	setUpBilling: async ({ locals, params, request }) => {
		const organisation = await requireStaffAt(locals, params.organisationId);
		const fields = readPostedSchedule((await request.formData()).get(billingFormFields.schedule));
		if (typeof fields === 'string') return fail(badRequest, { message: fields });
		const setUp = () => setUpOrganisationBilling(supabaseServiceClient(), organisation, fields);
		return savedOrRefused(setUp, `Billing set up for ${organisation.name}.`);
	},
	changeBilling: async ({ locals, params, request }) => {
		const organisation = await requireStaffAt(locals, params.organisationId);
		const formData = await request.formData();
		const fields = readPostedSchedule(formData.get(billingFormFields.schedule));
		if (typeof fields === 'string') return fail(badRequest, { message: fields });
		const scheduleId = formData.get(billingFormFields.scheduleId);
		const change = () => changeOrganisationBilling(supabaseServiceClient(), organisation, { ...fields, scheduleId });
		return savedOrRefused(change, `Billing saved for ${organisation.name}.`);
	},
	pauseBilling: async ({ locals, params, request }) => {
		const organisation = await requireStaffAt(locals, params.organisationId);
		const formData = await request.formData();
		const isPaused = readPostedPause(formData.get(billingFormFields.isPaused));
		if (typeof isPaused === 'string') return fail(badRequest, { message: isPaused });
		const scheduleId = formData.get(billingFormFields.scheduleId);
		const pause = () => pauseOrganisationBilling(supabaseServiceClient(), organisation, scheduleId, isPaused);
		return savedOrRefused(pause, isPaused ? 'Billing paused: nothing is raised until it is resumed.' : 'Billing resumed.');
	}
} satisfies Record<string, Action<{ organisationId: string }>>;
