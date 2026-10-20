import { fail, redirect } from '@sveltejs/kit';
import { isoDateOf } from '$lib/data/demo/demoDates';
import { isDemoKind, unknownDemoKindSentence, type DemoKindValue } from '$lib/data/demo/demoKinds';
import { seedDemoBusiness } from '$lib/data/demo/seed/seedDemoBusiness';
import { createDemoBusiness } from '$lib/server/demo/demoStore';
import { newDemoToken } from '$lib/server/demo/demoToken';
import { demoNotReadySentence } from '$lib/server/demo/openDemoCopy';
import { addressRateLimit } from '$lib/server/http/addressRateLimit';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { Actions } from './$types';

const HttpStatus = { seeOther: 303, badRequest: 400, tooManyRequests: 429, serviceUnavailable: 503 } as const;
const tenMinutesInMilliseconds = 10 * 60 * 1000;
const tooManyStartsMessage = 'Too many demos were started from here just now. Try again in a few minutes.';
const startsPerAddress = addressRateLimit({ allowance: 20, windowMilliseconds: tenMinutesInMilliseconds });

export const actions: Actions = {
	start: async ({ getClientAddress, request }) => {
		const clientAddress = getClientAddress();
		if (!startsPerAddress.isAllowedFrom(clientAddress)) {
			return fail(HttpStatus.tooManyRequests, { message: tooManyStartsMessage });
		}
		const form = await request.formData();
		const kind = form.get('kind');
		if (!isDemoKind(kind)) return fail(HttpStatus.badRequest, { message: unknownDemoKindSentence });
		const token = newDemoToken();
		const isStarted = await startCopyUnder(token, kind);
		if (!isStarted) return fail(HttpStatus.serviceUnavailable, { message: demoNotReadySentence });
		redirect(HttpStatus.seeOther, `/demo/${token}`);
	}
};

async function startCopyUnder(token: string, kind: DemoKindValue): Promise<boolean> {
	try {
		await createDemoBusiness(supabaseServiceClient(), token, seedDemoBusiness(kind, isoDateOf(new Date())));
		return true;
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return false;
		throw failure;
	}
}
