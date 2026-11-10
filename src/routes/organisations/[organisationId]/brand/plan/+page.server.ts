import { error, fail } from '@sveltejs/kit';
import { planMonthAsked } from '$lib/brand/plan/planMonth';
import { checkUkDayAndTime } from '$lib/brand/plan/checkUkDayAndTime';
import { findContentPlan } from '$lib/server/brandContent/findContentPlan';
import { replanContentPiece } from '$lib/server/brandContent/replanContentPiece';
import { replanPageAnswerFor } from '$lib/server/brandContent/replanPageAnswers';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { Actions, PageServerLoad } from './$types';

const brandModule = 'brand';
const BadRequest = 400;

export const load: PageServerLoad = async ({ locals, params, parent, url }) => {
	await parent();
	const check = planMonthAsked(url.searchParams.get('month'));
	if ('problem' in check) error(BadRequest, check.problem);
	const plan = await findContentPlan(locals.supabase, params.organisationId, check.month);
	return { plan };
};

export const actions = {
	move: async ({ locals, params, request }) => {
		const { organisation } = await requireOrganisationModule(locals, params.organisationId, brandModule);
		const form = await request.formData();
		const check = checkUkDayAndTime({ date: form.get('date'), time: form.get('time') });
		if ('problem' in check) return fail(BadRequest, { message: `${check.problem}.` });
		const contentPieceId = String(form.get('contentPieceId') ?? '');
		const piece = { organisationId: organisation.id, contentPieceId, plannedFor: check.moment };
		return replanPageAnswerFor(await replanContentPiece(locals.supabase, piece), check.moment);
	}
} satisfies Actions;
