import { goesWrongAround } from './mapServiceOutline';
import { isInOurProducts, productNameOf } from './mapProductNames';
import { stationState, type MapHandover, type MapStation } from './workflowMap';
import type { OrganisationWorkflowMaps } from './organisationWorkflowMaps';

/** Whether a product already runs, with a step done in it, or every step is only planned for it. */
export const productStages = { live: 'live', planned: 'planned' } as const;
export type ProductStage = (typeof productStages)[keyof typeof productStages];

/** A step a product takes on: the station, and the line it sits on. */
export type ProductStep = { stationKey: string; stationName: string; lineName: string };

/** One product the After puts work into: its name, whether it is live, the steps it takes on and what goes wrong there today. */
export type MapProduct = { name: string; stage: ProductStage; steps: ProductStep[]; fixes: string[] };

type StepInProduct = { station: MapStation; lineName: string; productName: string };

/** The products of the After, in the order it first names them; none until an After is filed. */
export function productsOnTheMap({ before, after, productNames }: OrganisationWorkflowMaps): MapProduct[] {
	if (after === null) return [];
	const today = before ?? after;
	const steps = after.lines.flatMap((line) =>
		line.stations.filter(isInOurProducts).map((station) => ({ station, lineName: line.name, productName: productNameOf(station, productNames) }))
	);
	const names = [...new Set(steps.map(({ productName }) => productName))];
	return names.map((name) => productOf(name, steps.filter(({ productName }) => productName === name), today.handovers));
}

function productOf(name: string, steps: StepInProduct[], handovers: MapHandover[]): MapProduct {
	const isLive = steps.some(({ station }) => station.state === stationState.ours);
	const fixes = [...new Set(steps.flatMap(({ station }) => goesWrongAround(station.key, handovers)))];
	return {
		name,
		stage: isLive ? productStages.live : productStages.planned,
		steps: steps.map(({ station, lineName }) => ({ stationKey: station.key, stationName: station.name, lineName })),
		fixes
	};
}
