const slugJoiner = /-+/g;

/** A Domain thing's slug as a person reads it: "work-order" is "Work order". */
export function thingNameOf(slug: string): string {
	const words = slug.replace(slugJoiner, ' ').trim();
	return words.charAt(0).toUpperCase() + words.slice(1);
}
