/** The tab an address names under its query key, or the fallback when it names none or one the page does not have. */
export function tabNamedIn<Key extends string>(address: URL, queryKey: string, keys: readonly Key[], fallback: Key): Key {
	const named = address.searchParams.get(queryKey);
	const known = keys.find((key) => key === named);
	return known ?? fallback;
}
