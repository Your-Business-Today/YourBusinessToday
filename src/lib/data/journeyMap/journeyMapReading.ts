import type { Journey, JourneyMap, MapView } from './journeyMap';

/** One journey's pass through a view: which step it is there, counted from 1, of how many, and what the person does. */
export type JourneyPass = {
	journey: Journey;
	stepNumber: number;
	stepCount: number;
	does: string | null;
};

const shortCommitLength = 7;

/** The commit a version was read from, as people quote it. */
export function shortCommit(journeyMap: JourneyMap): string {
	return journeyMap.commit.slice(0, shortCommitLength);
}

/** The view filed at a route; none when the version holds no view there. */
export function viewAtRoute(journeyMap: JourneyMap, route: string): MapView | undefined {
	return journeyMap.views.find((view) => view.route === route);
}

/** Every time a journey passes through the view at a route, in the order the journeys were read back. */
export function journeysThrough(journeyMap: JourneyMap, route: string): JourneyPass[] {
	return journeyMap.journeys.flatMap((journey) => passesOf(journey, route));
}

function passesOf(journey: Journey, route: string): JourneyPass[] {
	const { steps } = journey;
	const passes: JourneyPass[] = [];
	for (const [index, step] of steps.entries()) {
		if (step.route !== route) continue;
		passes.push({ journey, stepNumber: index + 1, stepCount: steps.length, does: step.does });
	}
	return passes;
}

/** The roles the journeys are for, each once, in the order the journeys were read back. */
export function rolesOf(journeyMap: JourneyMap): string[] {
	return [...new Set(journeyMap.journeys.map((journey) => journey.role))];
}
