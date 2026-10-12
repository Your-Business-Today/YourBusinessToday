import { areaEventKinds, type AreaEventKind } from './areaEventKind';
import type { AreaEvent } from './areaEvent';

const aColleague = 'A colleague';
const theRegisterSnapshot = 'The register snapshot';
const theFoodStandardsAgency = 'The Food Standards Agency';
const theDailyAccountsFile = 'The daily accounts file';
const theGazette = 'The Gazette';
const overtureMaps = 'Overture Maps';
const companiesHouse = 'Companies House';

const registerKinds: AreaEventKind[] = [
	areaEventKinds.companyArrived,
	areaEventKinds.companyMovedIn,
	areaEventKinds.companyLeft,
	areaEventKinds.statusChanged,
	areaEventKinds.accountsCategoryChanged,
	areaEventKinds.accountsOverdue,
	areaEventKinds.chargeRegistered,
	areaEventKinds.holdingCompanyOverTrading
];

const premisesKinds: AreaEventKind[] = [
	areaEventKinds.premisesOpened,
	areaEventKinds.premisesReinspected,
	areaEventKinds.premisesClosed,
	areaEventKinds.premisesChangedHands
];

const filingKinds: AreaEventKind[] = [areaEventKinds.accountsFiled, areaEventKinds.figuresRead];

const noticeKinds: AreaEventKind[] = [areaEventKinds.windingUpPetitioned, areaEventKinds.administrationOpened, areaEventKinds.liquidatorAppointed];

const placeKinds: AreaEventKind[] = [areaEventKinds.placeArrived, areaEventKinds.placeRemoved];

const liveRegisterKinds: AreaEventKind[] = [areaEventKinds.companyIncorporated, areaEventKinds.companyDissolved];

/** Who did it, or what: a person by name, or the source the event came from. */
export function areaEventActorName(event: AreaEvent): string {
	if (event.actorName !== null) return event.actorName;
	if (registerKinds.includes(event.kind)) return theRegisterSnapshot;
	if (premisesKinds.includes(event.kind)) return theFoodStandardsAgency;
	if (filingKinds.includes(event.kind)) return theDailyAccountsFile;
	if (noticeKinds.includes(event.kind)) return theGazette;
	if (placeKinds.includes(event.kind)) return overtureMaps;
	if (liveRegisterKinds.includes(event.kind)) return companiesHouse;
	return aColleague;
}
