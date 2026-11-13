import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { objectSchema, textField } from '../actionTypes';

const listOf = (items: Record<string, unknown>, description: string) => ({ type: 'array', items, description });

const routeField = (whichView: string) =>
	textField(`The route ${whichView}, starting with /, such as /projects/{projectId}, at most ${limits.routeLength} characters`);

const viewSchema = objectSchema(
	{
		route: routeField('of the view'),
		name: textField(`What people call the view, at most ${limits.viewNameLength} characters`),
		purpose: textField(`What the view is for, at most ${limits.purposeLength} characters`),
		shows: textField(`The thing the view shows, such as Invoice, at most ${limits.showsLength} characters`)
	},
	['route', 'name', 'purpose']
);

const linkSchema = objectSchema(
	{
		fromRoute: routeField('of the view the link starts at'),
		toRoute: routeField('of the view it leads to'),
		how: textField(`How it leads there, such as "a row of the table", at most ${limits.howLength} characters`)
	},
	['fromRoute', 'toRoute']
);

const entryPointSchema = objectSchema(
	{
		route: routeField('of the view people arrive at'),
		arrivesBy: textField(`How they arrive: sign in, a link in an email, the side bar; at most ${limits.arrivesByLength} characters`)
	},
	['route', 'arrivesBy']
);

const stepSchema = objectSchema(
	{
		route: routeField('of the view at this step'),
		does: textField(`What the person does there, at most ${limits.doesLength} characters`)
	},
	['route']
);

const journeySchema = objectSchema(
	{
		key: textField(`Your own key for the journey, lower-case words joined by hyphens, at most ${limits.keyLength} characters; keep it the same in every version`),
		name: textField(`The journey's name, at most ${limits.journeyNameLength} characters`),
		role: textField(`The role that travels it, at most ${limits.roleLength} characters`),
		story: textField(`The user story it carries out, as a…, I want…, so that…, at most ${limits.storyLength} characters`),
		stationKey: textField('The key of the workflow map station it carries out, when there is one'),
		steps: listOf(stepSchema, `The views it passes through in order, at most ${limits.mostStepsInAJourney}`)
	},
	['key', 'name', 'role', 'story', 'steps']
);

export const journeyMapFields = {
	commit: textField('The commit of the repository the map was read from, 7 to 40 lower-case hexadecimal characters'),
	views: listOf(viewSchema, `Every view of the product, at most ${limits.mostViews}`),
	links: listOf(linkSchema, `Which view leads to which, at most ${limits.mostLinks}`),
	entryPoints: listOf(entryPointSchema, `Where people arrive, at most ${limits.mostEntryPoints}`),
	journeys: listOf(journeySchema, `Each role's journeys through the views, at most ${limits.mostJourneys}`)
};
