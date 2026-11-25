import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { ReportedCostCentre } from '$lib/data/books/reports/profitByCostCentre';
import { reportedCostCentreOf } from '$lib/data/books/reports/reportedCostCentre';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { costCentreColumns, fromCostCentreRow, type CostCentre, type CostCentreRow } from './chartOfAccounts';
import { findCostCentres } from './costCentres';
import { projectOfOrganisation } from './costCentreProjectOwner';

const costCentresTable = 'books_cost_centres';
const PostgresErrors = { uniqueViolation: '23505' } as const;

type ProjectLinkRow = { id: string; project_id: string; projects: { name: string } | null };

/** The name of the project each cost centre is kept for, by cost centre; empty until the migration that keeps it has run. */
export async function findCostCentreProjectNames(supabase: SupabaseClient, organisationId: string): Promise<Map<string, string>> {
	const { data, error } = await supabase
		.from(costCentresTable)
		.select('id, project_id, projects(name)')
		.eq('organisation_id', organisationId)
		.not('project_id', 'is', null);
	if (error !== null && isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	return new Map((data as unknown as ProjectLinkRow[]).map(projectNameEntry));
}

/** Every cost centre as the profit by project reading names it, with the project it is kept for. */
export async function findReportedCostCentres(supabase: SupabaseClient, organisationId: string): Promise<ReportedCostCentre[]> {
	const [costCentres, projectNames] = await Promise.all([findCostCentres(supabase, organisationId), findCostCentreProjectNames(supabase, organisationId)]);
	return costCentres.map((costCentre) => reportedCostCentreOf(costCentre, projectNames.get(costCentre.id) ?? null));
}

/** Keeps the cost centre for one of the organisation's own projects, or for none when no project is given. */
export async function setCostCentreProject(supabase: SupabaseClient, organisationId: string, costCentreId: unknown, projectId: unknown): Promise<CostCentre> {
	refuseWhen(validateRecordId('cost centre', String(costCentreId ?? '')));
	const project = await projectOfOrganisation(supabase, organisationId, projectId);
	const { data, error } = await supabase
		.from(costCentresTable)
		.update({ project_id: project?.id ?? null })
		.eq('organisation_id', organisationId)
		.eq('id', costCentreId)
		.select(costCentreColumns)
		.maybeSingle();
	if (error?.code === PostgresErrors.uniqueViolation)
		throw new BooksRefusal(`Another cost centre is already kept for project ${project?.name}; a project has one cost centre in the books.`);
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No cost centre ${costCentreId} is in this organisation's books; list_cost_centres lists them.`);
	return fromCostCentreRow(data as unknown as CostCentreRow);
}

function projectNameEntry(row: ProjectLinkRow): [string, string] {
	const project = row.projects;
	return [row.id, project?.name ?? ''];
}

/** The cost centre each project is kept in, by project; empty until the migration that keeps it has run. */
export async function findProjectCostCentres(supabase: SupabaseClient, organisationId: string): Promise<Map<string, string>> {
	const { data, error } = await supabase.from(costCentresTable).select('id, project_id').eq('organisation_id', organisationId).not('project_id', 'is', null);
	if (error !== null && isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	return new Map((data as { id: string; project_id: string }[]).map((row) => [row.project_id, row.id]));
}
