/** A brand's month of three pieces on two posts, held in memory, for the tests of approving a month together. */
export const approvalIds = {
	doorsOnInstagram: '11111111-1111-4111-8111-111111111111',
	doorsOnFacebook: '22222222-2222-4222-8222-222222222222',
	roofsOnLinkedIn: '33333333-3333-4333-8333-333333333333'
};

export const lastChanged = '2026-11-01T10:00:00+00:00';

export const approvalWorld = {
	stages: new Map<string, string>(),
	updatedAt: new Map<string, string>(),
	movedOnByOthers: new Set<string>(),
	reviews: [] as unknown[]
};

export function resetApprovalWorld() {
	const ids = Object.values(approvalIds);
	approvalWorld.stages = new Map(ids.map((id) => [id, 'awaiting_approval']));
	approvalWorld.updatedAt = new Map(ids.map((id) => [id, lastChanged]));
	approvalWorld.movedOnByOthers = new Set();
	approvalWorld.reviews = [];
}

function plannedChannel(id: string, postId: string, mediumPath: string) {
	const words = { kind: 'tip', title: `Post ${postId}`, hook: '', caption: `Words for ${mediumPath}` };
	const day = { plannedFor: '2026-11-03T09:00:00Z', scheduledFor: null };
	return { id, postId, mediumPath, ...words, ...day, stage: approvalWorld.stages.get(id), updatedAt: approvalWorld.updatedAt.get(id) };
}

export function plannedPiecesInWorld() {
	const { doorsOnInstagram, doorsOnFacebook, roofsOnLinkedIn } = approvalIds;
	return [
		plannedChannel(doorsOnInstagram, 'doors', 'image.post.instagram'),
		plannedChannel(doorsOnFacebook, 'doors', 'image.post.facebook'),
		plannedChannel(roofsOnLinkedIn, 'roofs', 'text.post.linkedin')
	];
}

export function stageInWorld(_supabase: unknown, _organisationId: string, id: string) {
	if (approvalWorld.movedOnByOthers.has(id)) return 'scheduled';
	return approvalWorld.stages.get(id) ?? null;
}

type MoveInWorld = { rule: { from: string[]; to: string } };

export function movePieceInApprovalWorld(_supabase: unknown, _organisationId: string, id: string, { rule }: MoveInWorld) {
	const isFrom = rule.from.includes(approvalWorld.stages.get(id) ?? '');
	if (isFrom) approvalWorld.stages.set(id, rule.to);
	return isFrom;
}
