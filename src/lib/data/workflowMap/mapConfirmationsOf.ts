import { mapStage, type WorkflowMapVersion } from './workflowMap';
import type { MapConfirmation, MapConfirmations } from './mapConfirmed';
import type { OrganisationWorkflowMaps } from './organisationWorkflowMaps';

/** Whether the client confirmed this very version; none for a version filed since their last confirmation. */
export function confirmationOf(confirmed: MapConfirmation[], map: WorkflowMapVersion | null): MapConfirmation | null {
	if (map === null) return null;
	const isThisVersion = (candidate: MapConfirmation) =>
		candidate.stage === map.stage && candidate.versionNumber === map.versionNumber;
	return confirmed.find(isThisVersion) ?? null;
}

/** The confirmations of the latest Before and After an organisation's page and portal show. */
export function confirmationsOfMaps(confirmed: MapConfirmation[], maps: OrganisationWorkflowMaps): MapConfirmations {
	return { before: confirmationOf(confirmed, maps.before), after: confirmationOf(confirmed, maps.after) };
}

/** The Before the client confirmed, which freezes the Before; none while no Before is confirmed. */
export function confirmedBeforeOf(confirmed: MapConfirmation[]): MapConfirmation | null {
	const befores = confirmed.filter((candidate) => candidate.stage === mapStage.before);
	if (befores.length === 0) return null;
	return befores.reduce((latest, candidate) => (candidate.versionNumber > latest.versionNumber ? candidate : latest));
}
