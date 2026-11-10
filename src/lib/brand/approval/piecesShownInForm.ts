/** The pieces the approval form carried, each id paired with when it was last changed as the page read it. */
export function piecesShownInForm(form: FormData): Record<string, unknown>[] {
	const updatedAts = form.getAll('updatedAt');
	return form.getAll('contentPieceId').map((contentPieceId, index) => ({ contentPieceId, updatedAt: updatedAts[index] }));
}
