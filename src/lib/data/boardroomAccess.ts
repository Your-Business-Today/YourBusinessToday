import { canUseOrganisationModule, type ModuleOrganisation } from './organisationModuleAccess';
import { sittingSeatOf, type BoardroomDirector } from './boardroomDirector';
import type { OrganisationPlace, OrganisationVisitor } from './organisationAccess';

const boardroomModule = 'boardroom';

/** A boardroom: the organisation with its switched-on modules, and everyone ever named to its board. */
export type Boardroom = ModuleOrganisation & { directors: BoardroomDirector[] };

/**
 * Who enters an organisation's boardroom. The one module rule is asked first; then the person must
 * be a sitting director and on the organisation itself. Being staff, or on the organisation above,
 * lets nobody in who is not named. The database asks the same through is_boardroom_director.
 */
export function canEnterBoardroom(visitor: OrganisationVisitor, boardroom: Boardroom): boolean {
	if (!canUseOrganisationModule(visitor, boardroom, boardroomModule)) return false;
	if (sittingSeatOf(boardroom.directors, visitor.accountId) === null) return false;
	return isOnTheOrganisationItself(visitor, boardroom.organisation);
}

function isOnTheOrganisationItself(visitor: OrganisationVisitor, organisation: OrganisationPlace): boolean {
	const ownMemberships = visitor.organisationMemberships.filter((membership) => membership.accountId === visitor.accountId);
	return ownMemberships.some((membership) => membership.organisationId === organisation.id);
}
