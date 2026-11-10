/** A books write or reading refused for a reason the caller can act on; the message names the field and the limit. */
export class BooksRefusal extends Error {}

export function refuseWhen(refusal: string | null): void {
	if (refusal !== null) throw new BooksRefusal(refusal);
}
