import { validateRecordId } from '$lib/data/isUuid';
import { refuseWhen } from './booksRefusal';

/** The cost centre a reading is narrowed to, or null for all of them; anything but a whole id is refused. */
export function validatedCostCentreId(candidate: unknown): string | null {
	if (candidate === undefined || candidate === null || candidate === '') return null;
	refuseWhen(validateRecordId('cost centre', String(candidate)));
	return candidate as string;
}
