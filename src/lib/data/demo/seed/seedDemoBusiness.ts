import type { DemoBusiness } from '../demoBusiness';
import { DemoKind, type DemoKindValue } from '../demoKinds';
import { seedBookkeepingBusiness } from './bookkeeping/seedBookkeepingBusiness';
import { seedJoineryBusiness } from './joinery/seedJoineryBusiness';

const seedForKind: Record<DemoKindValue, (today: string) => Omit<DemoBusiness, 'log'>> = {
	[DemoKind.construction]: seedJoineryBusiness,
	[DemoKind.bookkeeping]: seedBookkeepingBusiness
};

/** A fresh copy of the made-up business of one kind, its dates set relative to the day it starts. */
export function seedDemoBusiness(kind: DemoKindValue, today: string): DemoBusiness {
	const seed = seedForKind[kind];
	return { ...seed(today), log: [{ on: today, sentence: 'Your private copy of the demo started fresh.' }] };
}

/** The same kind of business as a copy, back to how it started. */
export function startedAgain(business: DemoBusiness, today: string): DemoBusiness {
	return seedDemoBusiness(business.kind, today);
}
