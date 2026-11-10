import { businessBrainFileRecordings, recordBusinessBrainFile } from '$lib/server/businessBrain/recordBusinessBrainFile';
import { fileAlreadyRecorded, fileNotArrived, fileRecorded, linkLapsedUnused, noSuchBusinessBrainFile, uploadGranted } from './businessBrainFileAnswers';
import { findBusinessBrainFileSentBy } from '$lib/server/businessBrain/findBusinessBrainFile';
import { grantBusinessBrainFileUpload } from '$lib/server/businessBrain/grantBusinessBrainFileUpload';
import { readText } from '../actionTypes';
import { validateBusinessBrainFile } from '$lib/data/businessBrainFileRules';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Grants the link a source file is sent to, once its name, type and size are checked. */
export async function grantFileUpload(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const file = validateBusinessBrainFile(readText(input, 'filename'), readText(input, 'mimeType'), input.byteCount);
	if (typeof file === 'string') return file;
	const sender = { organisationId: organisation.id, accountId: caller.accountId };
	const granted = await grantBusinessBrainFileUpload(caller.supabase, sender, file);
	return uploadGranted(organisation, file, granted);
}

/** Keeps the file that arrived at a link this person was granted. */
export async function recordFileUpload(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const fileId = readText(input, 'fileId');
	const idRefusal = validateRecordId('fileId', fileId);
	if (idRefusal !== null) return idRefusal;
	const sender = { organisationId: organisation.id, accountId: caller.accountId };
	const file = await findBusinessBrainFileSentBy(caller.supabase, sender, fileId);
	if (file === null) return noSuchBusinessBrainFile;
	const recording = await recordBusinessBrainFile(caller.supabase, file);
	if (recording.status === businessBrainFileRecordings.recorded) return fileRecorded(organisation, file, recording.byteCount);
	if (recording.status === businessBrainFileRecordings.notArrived) return fileNotArrived;
	if (recording.status === businessBrainFileRecordings.lapsed) return linkLapsedUnused;
	return fileAlreadyRecorded(file);
}
