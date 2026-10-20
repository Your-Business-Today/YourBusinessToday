import { error } from '@sveltejs/kit';
import { isoDateOf } from '$lib/data/demo/demoDates';
import { findMoneyAndOpportunity } from '$lib/data/demo/moneyAndOpportunity';
import { seedDemoBusiness } from '$lib/data/demo/seed/seedDemoBusiness';
import { demoNotReadySentence, noSuchDemoSentence, openDemoCopy } from '$lib/server/demo/openDemoCopy';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { DemoCopy } from '$lib/server/demo/answerDemoRequest';
import type { Actions, PageServerLoad } from './$types';

const HttpStatus = { notFound: 404, serviceUnavailable: 503 } as const;

export const load: PageServerLoad = async ({ params, url }) => {
	const copy = await openCopyOrFail(params.token);
	return {
		business: copy.business,
		today: copy.today,
		findings: findMoneyAndOpportunity(copy.business, copy.today),
		demoUrl: `${url.origin}/demo/${params.token}`,
		connectorUrl: `${url.origin}/api/demo/${params.token}/mcp`
	};
};

export const actions: Actions = {
	startAgain: async ({ params }) => {
		const copy = await openCopyOrFail(params.token);
		await copy.save(seedDemoBusiness(isoDateOf(new Date())));
		return { isStartedAgain: true };
	}
};

async function openCopyOrFail(token: string): Promise<DemoCopy> {
	const copy = await openCopyOrNotReady(token);
	if (copy === null) error(HttpStatus.notFound, noSuchDemoSentence);
	return copy;
}

async function openCopyOrNotReady(token: string): Promise<DemoCopy | null> {
	try {
		return await openDemoCopy(token);
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) error(HttpStatus.serviceUnavailable, demoNotReadySentence);
		throw failure;
	}
}
