import { isUuid } from './isUuid';

/** Why a confirmation cannot be recorded, or null when it can: the id names a database_tasks row, a uuid, before Postgres is asked. */
export function validateDatabaseTaskConfirmation(databaseTaskId: string): string | null {
	if (isUuid(databaseTaskId)) return null;
	return 'A database task is named by its id, as list_database_tasks or the database tasks page gives it.';
}
