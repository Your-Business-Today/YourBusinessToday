import { fail } from '@sveltejs/kit';
import { checkLibraryItem } from '$lib/brand/library/checkLibraryItem';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { grantLibraryUpload } from '$lib/server/brandLibrary/grantLibraryUpload';
import { libraryRecordingRefusal, libraryRefusals, notAddedBecause } from './libraryRefusals';
import { parseUuidField } from '$lib/server/projects/parseAttachmentUploadForm';
import { recordLibraryUpload } from '$lib/server/brandLibrary/recordLibraryUpload';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { Actions } from './$types';

const badRequestStatus = 400;
const conflictStatus = 409;
const describedFields = ['filename', 'mimeType', 'shows', 'takenOn', 'posting', 'permissionGivenBy'];

/** The item as the form described it, each field as given and the size as a number, for the check to judge. */
function describedItem(formData: FormData): Record<string, unknown> {
	const given = Object.fromEntries(describedFields.map((field) => [field, formData.get(field) ?? undefined]));
	return { ...given, byteCount: Number(formData.get('byteCount')) };
}

function refuseItem(problem: string) {
	return fail(badRequestStatus, { message: notAddedBecause(problem) });
}

async function requireBrandAdder(locals: App.Locals, organisationId: string) {
	const { user } = await requireOrganisationModule(locals, organisationId, 'brand');
	return { organisationId, accountId: user.id };
}

export const libraryActions: Actions = {
	grantItem: async ({ locals, params, request }) => {
		const adder = await requireBrandAdder(locals, params.organisationId);
		const described = describedItem(await request.formData());
		const item = checkLibraryItem(described);
		if (typeof item === 'string') return refuseItem(item);
		const summary = await findBrandSummary(locals.supabase, adder.organisationId);
		if (summary === null) return fail(conflictStatus, { message: libraryRefusals.noBrandYet });
		return grantLibraryUpload(locals.supabase, adder, item);
	},
	recordItem: async ({ locals, params, request }) => {
		const adder = await requireBrandAdder(locals, params.organisationId);
		const itemId = parseUuidField(await request.formData(), 'itemId');
		if (itemId === null) return fail(badRequestStatus, { message: libraryRefusals.noItemGiven });
		const refusal = libraryRecordingRefusal(await recordLibraryUpload(locals.supabase, adder, itemId));
		if (refusal !== null) return fail(badRequestStatus, { message: refusal });
		return {};
	}
};
