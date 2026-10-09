import { attachmentLinkKinds, type AttachmentLinkKind } from '$lib/data/attachmentLinkKind';

export function attachmentHref(
	projectId: string,
	taskId: string,
	attachmentId: string,
	kind: AttachmentLinkKind
): string {
	const attachmentPath = `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`;
	if (kind === attachmentLinkKinds.open) return attachmentPath;
	return `${attachmentPath}?download`;
}
