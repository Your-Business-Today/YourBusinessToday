import { accountNameLookup } from '$lib/data/accountNames';
import type { Account } from '$lib/server/accounts/accountRecord';

export function withUploaderNames<Upload extends { uploadedBy: string }>(
	uploads: Upload[],
	people: Account[]
) {
	const nameOf = accountNameLookup(people);
	return uploads.map((upload) => ({
		...upload,
		uploaderName: nameOf(upload.uploadedBy)
	}));
}
