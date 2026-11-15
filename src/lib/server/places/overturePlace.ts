type PrimaryName = { primary?: string | null };
type PlaceAddress = { freeform?: string | null; postcode?: string | null };
type Corner = { xmin?: number | null; ymin?: number | null };

/** One of the sources a place's facts were taken from, with the licence that source gives them under. */
export type PlaceSource = { license?: string | null };

/** A place as a release of Overture Maps holds it, in the columns a premises row is made from. */
export type OverturePlace = {
	id?: string | null;
	names?: PrimaryName | null;
	taxonomy?: PrimaryName | null;
	websites?: (string | null)[] | null;
	phones?: (string | null)[] | null;
	confidence?: number | null;
	addresses?: (PlaceAddress | null)[] | null;
	bbox?: Corner | null;
	sources?: (PlaceSource | null)[] | null;
	operating_status?: string | null;
};

/** The leaves of a release's places file a premises row is made from: a places file carries some fifty, and only these are read. */
export const placeLeaves = [
	'id',
	'names.primary',
	'taxonomy.primary',
	'websites.list.element',
	'phones.list.element',
	'confidence',
	'addresses.list.element.freeform',
	'addresses.list.element.postcode',
	'bbox.xmin',
	'bbox.ymin',
	'sources.list.element.license',
	'operating_status'
];

/** The leaves that say where a place stood, for the list of places a release took out. */
export const removedPlaceLeaves = ['id', 'bbox.xmin', 'bbox.ymin'];
