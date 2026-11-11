import type { MoveWords } from './journalSet';

/** A month-end posting in words, and where to read the ledger when it cannot be told whether it was posted. */
export function periodEndWords(move: string): MoveWords {
	return { move, whereItStands: 'explain_account_balance says what the expense account holds' };
}
