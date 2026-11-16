import { afterEach, describe, expect, it, vi } from 'vitest';
import { listBucketFiles, listBucketFolders, overtureBucketUrl } from './overtureBucket';

const asked: string[] = [];

function bucketAnswers(body: string, status = 200): void {
	vi.stubGlobal('fetch', async (address: string) => {
		asked.push(address);
		return new Response(body, { status });
	});
}

const releasesListed =
	'<ListBucketResult><IsTruncated>false</IsTruncated>' +
	'<CommonPrefixes><Prefix>release/2026-09-23.1/</Prefix></CommonPrefixes>' +
	'<CommonPrefixes><Prefix>release/2026-10-21.0/</Prefix></CommonPrefixes></ListBucketResult>';

const filesListed =
	'<ListBucketResult><IsTruncated>false</IsTruncated>' +
	'<Contents><Key>release/2026-10-21.0/theme=places/type=place/part-00000.zstd.parquet</Key><LastModified>2026-10-21T10:00:00.000Z</LastModified><Size>812345678</Size></Contents>' +
	'<Contents><Key>release/2026-10-21.0/theme=places/type=place/part-00001.zstd.parquet</Key><LastModified>2026-10-21T10:00:00.000Z</LastModified><Size>734000111</Size></Contents></ListBucketResult>';

describe("Overture's bucket", () => {
	afterEach(() => {
		asked.length = 0;
		vi.unstubAllGlobals();
	});

	it('lists the folders straight under a prefix, each by its own name', async () => {
		bucketAnswers(releasesListed);
		expect(await listBucketFolders('release/')).toEqual(['2026-09-23.1', '2026-10-21.0']);
		expect(asked).toEqual([`${overtureBucketUrl}?list-type=2&prefix=release%2F&delimiter=%2F`]);
	});

	it('lists the files under a prefix with the address and the length of each, so no file is asked its length again', async () => {
		bucketAnswers(filesListed);
		expect(await listBucketFiles('release/2026-10-21.0/theme=places/type=place/')).toEqual([
			{ url: `${overtureBucketUrl}release/2026-10-21.0/theme=places/type=place/part-00000.zstd.parquet`, byteLength: 812_345_678 },
			{ url: `${overtureBucketUrl}release/2026-10-21.0/theme=places/type=place/part-00001.zstd.parquet`, byteLength: 734_000_111 }
		]);
	});

	it('refuses a list the bucket cut short, never reading it as though it were whole', async () => {
		bucketAnswers(filesListed.replace('<IsTruncated>false</IsTruncated>', '<IsTruncated>true</IsTruncated>'));
		await expect(listBucketFiles('release/2026-10-21.0/')).rejects.toThrow("Overture's bucket cut short its list of what is under release/2026-10-21.0/");
	});

	it('says what the bucket answered when it does not answer with a list', async () => {
		bucketAnswers('<Error><Code>SlowDown</Code></Error>', 503);
		await expect(listBucketFolders('release/')).rejects.toThrow("Overture's bucket answered 503 when asked what is under release/");
	});
});
