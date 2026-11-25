import type { ReportedCostCentre } from './profitByCostCentre';

type NamedCostCentre = { id: string; name: string; isArchived: boolean };

/** The cost centre under its own name, with the project it is kept for beside it when the two names differ. */
export function reportedCostCentreOf(costCentre: NamedCostCentre, projectName: string | null): ReportedCostCentre {
	const isNamedForItsProject = projectName === null || projectName === costCentre.name;
	const label = isNamedForItsProject ? costCentre.name : `${costCentre.name} (${projectName})`;
	return { id: costCentre.id, label, isArchived: costCentre.isArchived };
}
