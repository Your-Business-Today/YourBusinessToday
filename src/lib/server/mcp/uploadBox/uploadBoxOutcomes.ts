import { describeByteCount } from '$lib/data/taskAttachmentRules';
import type { McpDataAnswer } from '../mcpContent';

export type UploadBoxOutcome = 'opened' | 'granted' | 'attached' | 'refused';

export const uploadBoxOutcomes = {
	opened: 'opened',
	granted: 'granted',
	attached: 'attached',
	refused: 'refused'
} as const;

export type AttachedFile = { attachmentId: string; filename: string; byteCount: number };

export function refusedBecause(reason: string): McpDataAnswer {
	return { data: { outcome: uploadBoxOutcomes.refused, reason } };
}

/** The size goes back in words as well, so the box need not know how sizes are written here. */
export function attachedAs(file: AttachedFile): McpDataAnswer {
	const size = describeByteCount(file.byteCount);
	return { data: { outcome: uploadBoxOutcomes.attached, ...file, size } };
}
