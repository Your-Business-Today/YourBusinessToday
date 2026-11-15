import { listBucketFiles, listBucketFolders, type BucketFile } from './overtureBucket';

const releasesFolder = 'release/';
const releaseName = /^\d{4}-\d{2}-\d{2}\.\d+$/;
const dayFromNumber = '.';

/** The newest release Overture keeps, found from the bucket's own list, never typed in. */
export async function findNewestRelease(): Promise<string> {
	const newest = newestReleaseOf(await listBucketFolders(releasesFolder));
	if (newest === null) throw new Error("Overture's bucket lists no release");
	return newest;
}

/** The newest of the names that are a release's, by the day in the name and then its number that day, or null when none is. */
export function newestReleaseOf(names: string[]): string | null {
	const releases = names.filter((name) => releaseName.test(name)).sort(byDayThenNumber);
	return releases.at(-1) ?? null;
}

function byDayThenNumber(first: string, second: string): number {
	const [firstDay, firstNumber] = first.split(dayFromNumber);
	const [secondDay, secondNumber] = second.split(dayFromNumber);
	return firstDay.localeCompare(secondDay) || Number(firstNumber) - Number(secondNumber);
}

/** The files that hold every place of a release. */
export function listPlaceFiles(release: string): Promise<BucketFile[]> {
	return listBucketFiles(`release/${release}/theme=places/type=place/`);
}

/** The files that name the places a release took out since the release before it. */
export function listRemovedPlaceFiles(release: string): Promise<BucketFile[]> {
	return listBucketFiles(`changelog/${release}/theme=places/type=place/change_type=removed/`);
}
