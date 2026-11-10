import { formatPoundsAndPence, fromPence } from '$lib/data/books/money';
import type { Campaign, CampaignPiece } from '$lib/brand/campaigns/campaign';

const noPieces = '  No content is behind it yet.';

/** One campaign as a listing shows it: where it stands, what it pays for, its budget and dates, and its pieces. */
export function describeCampaign(campaign: Campaign): string {
	const budget = formatPoundsAndPence(fromPence(campaign.budgetPence));
	const { status, name, objective, startsOn, endsOn, id } = campaign;
	const heading = `- [${status}] ${name}: ${objective}, ${budget}, ${startsOn} to ${endsOn} (id ${id})`;
	const pieceLines = campaign.pieces.map(describePiece);
	return [heading, ...(pieceLines.length === 0 ? [noPieces] : pieceLines)].join('\n');
}

function describePiece(piece: CampaignPiece): string {
	return `  - [${piece.stage}] ${piece.title} (id ${piece.contentPieceId})`;
}
