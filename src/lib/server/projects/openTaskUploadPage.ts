import { companyDetails } from '$lib/data/companyDetails';
import { signTaskUploadLink, taskUploadLinkFor, uploadPagePath } from './taskUploadLink';
import { uploadLinkSigningKey } from './uploadLinkSigningKey';

/** The address of a page that takes files for one task, as one person, with no sign-in, for a limited time. */
export function openTaskUploadPage(taskId: string, grantedTo: string): string {
	const link = taskUploadLinkFor(taskId, grantedTo, new Date());
	const token = signTaskUploadLink(link, uploadLinkSigningKey());
	return `${companyDetails.websiteUrl}${uploadPagePath}/${token}`;
}
