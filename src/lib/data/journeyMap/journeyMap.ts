/** One screen of a product, by its route: what it is for and the thing it shows, when it shows one. */
export type MapView = {
	route: string;
	name: string;
	purpose: string;
	shows: string | null;
};

/** One view leading to another, and how, when the filer said. */
export type MapLink = {
	fromRoute: string;
	toRoute: string;
	how: string | null;
};

/** Where a person arrives in the product: sign in, a link in an email, the side bar. */
export type EntryPoint = {
	route: string;
	arrivesBy: string;
};

/** One view on a journey, in order, with what the person does there when the filer said. */
export type JourneyStep = {
	route: string;
	does: string | null;
};

/** One user story's path through the views, for one role, and the workflow map station it carries out. */
export type Journey = {
	key: string;
	name: string;
	role: string;
	story: string;
	stationKey: string | null;
	steps: JourneyStep[];
};

/** Everything one filing holds: a whole version, read from one commit, never a change to one. */
export type JourneyMapDraft = {
	commit: string;
	views: MapView[];
	links: MapLink[];
	entryPoints: EntryPoint[];
	journeys: Journey[];
};

/** A filed version, as it is read back: numbered from 1 for each product. */
export type JourneyMap = JourneyMapDraft & {
	versionNumber: number;
	filedAt: string;
};
