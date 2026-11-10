import { describe, expect, it } from 'vitest';
import { piecesShownInForm } from './piecesShownInForm';

describe('the pieces the approval form carried', () => {
	it('pairs each piece the form carried with when it was last changed as the page read it', () => {
		const form = new FormData();
		form.append('contentPieceId', 'first');
		form.append('updatedAt', '2026-11-01T10:00:00Z');
		form.append('contentPieceId', 'second');
		form.append('updatedAt', '2026-11-02T10:00:00Z');
		expect(piecesShownInForm(form)).toEqual([
			{ contentPieceId: 'first', updatedAt: '2026-11-01T10:00:00Z' },
			{ contentPieceId: 'second', updatedAt: '2026-11-02T10:00:00Z' }
		]);
	});
});
