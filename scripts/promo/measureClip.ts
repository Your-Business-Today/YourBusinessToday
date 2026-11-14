import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const runProbe = promisify(execFile);

const wideFromRatio = 1.2;
const tallBelowRatio = 0.84;
const quarterTurn = 90;

type ProbedStream = { width?: number; height?: number; side_data_list?: { rotation?: number }[] };

/** The film's shape from its first clip as it is shown, a phone's turned video turned back: wide, square or tall, as the site's player chooses. */
export async function shapeOfClip(clipUrl: string): Promise<string> {
	const probe = ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation', '-of', 'json', clipUrl];
	const { stdout } = await runProbe('ffprobe', probe);
	const [stream = {}]: ProbedStream[] = JSON.parse(stdout).streams ?? [];
	const { width = 0, height = 0, side_data_list: sideData = [] } = stream;
	const rotation = Math.abs(sideData.find((entry) => entry.rotation !== undefined)?.rotation ?? 0);
	const isTurned = rotation === quarterTurn;
	const ratio = isTurned ? height / width : width / height;
	if (!Number.isFinite(ratio) || ratio >= wideFromRatio) return 'wide';
	if (ratio < tallBelowRatio) return 'tall';
	return 'square';
}
