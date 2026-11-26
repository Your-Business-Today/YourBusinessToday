import { tablesKeptByOrganisation } from './tablesKeptByOrganisation';

/** A parent a table is reached through: the parent table, and its own column that leads on up. */
export type ParentLink = { tableName: string; keyColumn: string };

/**
 * A table an organisation's export reads: by its own organisation column, or, for a table that has none, by the
 * column that points at its parent, through its parents up to the one that has.
 */
export type ExportedTable = { tableName: string; keyColumn: string; parents: ParentLink[] };

const organisationColumn = 'organisation_id';

const meetings: ParentLink = { tableName: 'boardroom_meetings', keyColumn: organisationColumn };
const contextVersions: ParentLink = { tableName: 'company_context_versions', keyColumn: organisationColumn };
const contextParts: ParentLink = { tableName: 'company_context_parts', keyColumn: 'version_id' };
const mapVersions: ParentLink = { tableName: 'workflow_map_versions', keyColumn: organisationColumn };
const mapStations: ParentLink = { tableName: 'workflow_map_stations', keyColumn: 'version_id' };
const newsStories: ParentLink = { tableName: 'news_stories', keyColumn: organisationColumn };
const projects: ParentLink = { tableName: 'projects', keyColumn: organisationColumn };
const documents: ParentLink = { tableName: 'project_documents', keyColumn: organisationColumn };
const contractPacks: ParentLink = { tableName: 'contract_packs', keyColumn: organisationColumn };

const underAParent = (tableName: string, keyColumn: string, ...parents: ParentLink[]): ExportedTable => ({
	tableName,
	keyColumn,
	parents
});

const tablesKeptUnderAParent: ExportedTable[] = [
	underAParent('boardroom_agenda_items', 'meeting_id', meetings),
	underAParent('company_context_parts', 'version_id', contextVersions),
	underAParent('company_context_links', 'version_id', contextVersions),
	underAParent('company_context_connectors', 'version_id', contextVersions),
	underAParent('company_context_confirmations', 'version_id', contextVersions),
	underAParent('company_context_steps', 'process_part_id', contextParts, contextVersions),
	underAParent('company_context_part_reviews', 'part_id', contextParts, contextVersions),
	underAParent('workflow_map_lines', 'version_id', mapVersions),
	underAParent('workflow_map_stations', 'version_id', mapVersions),
	underAParent('workflow_map_arrivals', 'version_id', mapVersions),
	underAParent('workflow_map_handovers', 'version_id', mapVersions),
	underAParent('workflow_map_confirmations', 'version_id', mapVersions),
	underAParent('workflow_map_station_reviews', 'station_id', mapStations, mapVersions),
	underAParent('news_story_marks', 'story_id', newsStories),
	underAParent('project_brand_kits', 'project_id', projects),
	underAParent('project_status_changes', 'project_id', projects),
	underAParent('project_brand_kit_traits', 'project_id', projects),
	underAParent('project_brand_kit_decisions', 'project_id', projects),
	underAParent('project_document_versions', 'document_id', documents),
	underAParent('project_document_input_requests', 'document_id', documents),
	underAParent('contract_pack_documents', 'pack_id', contractPacks),
	underAParent('contract_pack_comments', 'pack_id', contractPacks),
	underAParent('contract_pack_signatures', 'pack_id', contractPacks)
];

/** Every table that holds an organisation's rows, the organisation's own row first. */
export const organisationExportTables: ExportedTable[] = [
	{ tableName: 'organisations', keyColumn: 'id', parents: [] },
	...tablesKeptByOrganisation.map((tableName) => ({ tableName, keyColumn: organisationColumn, parents: [] })),
	...tablesKeptUnderAParent
];
