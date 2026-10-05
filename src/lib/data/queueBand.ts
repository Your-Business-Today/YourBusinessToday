/**
 * The owner's queue is worked in three bands, kept by the database as tasks
 * join it (migration 0068): what the people using a live project asked for,
 * then the owner's own work on live projects, then everything on projects that
 * are scoping, on hold or complete.
 */

type Requested = { requestedBy: string; projectOwnerId: string | null };

/** A task asked for by someone other than the project's owner. */
export function isRequest(task: Requested): boolean {
	if (task.projectOwnerId === null) return false;
	return task.requestedBy !== task.projectOwnerId;
}
