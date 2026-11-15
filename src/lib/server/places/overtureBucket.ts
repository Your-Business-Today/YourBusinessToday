/** Overture Maps' public bucket: anyone may list it and read from it, with no key. */
export const overtureBucketUrl = 'https://overturemaps-us-west-2.s3.amazonaws.com/';

/** A file in the bucket with its length, so a reader need not ask for the length again. */
export type BucketFile = { url: string; byteLength: number };

const folderSeparator = '/';
/** The version of the bucket's list that says outright when it has been cut short. */
const listVersion = '2';
const folderPattern = /<CommonPrefixes><Prefix>([^<]+)<\/Prefix><\/CommonPrefixes>/g;
const filePattern = /<Contents><Key>([^<]+)<\/Key>[\s\S]*?<Size>(\d+)<\/Size>/g;
const cutShortMark = '<IsTruncated>true</IsTruncated>';

/** The folders straight under a prefix, each by its own name. */
export async function listBucketFolders(prefix: string): Promise<string[]> {
	const listing = await readListing({ prefix, delimiter: folderSeparator });
	return [...listing.matchAll(folderPattern)].map(([, folder]) => folder.slice(prefix.length, -folderSeparator.length));
}

/** The files under a prefix, each with its address and its length. */
export async function listBucketFiles(prefix: string): Promise<BucketFile[]> {
	const listing = await readListing({ prefix });
	return [...listing.matchAll(filePattern)].map(([, key, size]) => ({ url: `${overtureBucketUrl}${key}`, byteLength: Number(size) }));
}

/** One page of the bucket's list. A list cut short is refused, never read as though it were whole. */
async function readListing(narrowing: { prefix: string; delimiter?: string }): Promise<string> {
	const query = new URLSearchParams({ 'list-type': listVersion, ...narrowing });
	const response = await fetch(`${overtureBucketUrl}?${query}`);
	if (!response.ok) throw new Error(`Overture's bucket answered ${response.status} when asked what is under ${narrowing.prefix}`);
	const listing = await response.text();
	if (listing.includes(cutShortMark)) throw new Error(`Overture's bucket cut short its list of what is under ${narrowing.prefix}`);
	return listing;
}
