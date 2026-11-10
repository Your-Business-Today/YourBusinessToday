export const contentPieceId = '0b7f3c2e-4a1d-4c55-9a0e-3f1e2d4c5b6a';

export const jewel = { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' };

const summary = {
	id: contentPieceId,
	mediumPath: 'video.short.tiktok',
	title: 'Fire doors',
	stage: 'drafted',
	scheduledFor: null
};
const words = { hook: 'Hear that?', script: 'A door closes.', caption: 'Plainly', invitedAction: 'save', publishedUrl: '' };
const shot = { description: 'A door closes', seconds: 3, onScreenText: '' };

export const contentSummary = { ...summary, updatedAt: '' };

export const contentPiece = { ...contentSummary, ...words, storyboard: [shot], brandSnapshot: { brief: 'Brand brief: Jewel' }, plannedFor: null };
