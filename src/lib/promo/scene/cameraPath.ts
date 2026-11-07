import { Vector3, type PerspectiveCamera } from 'three';
import { chapterBeat, type PromoChapterId } from '../promoTimeline';
import { offsetFrom, promoSets, type Point } from './promoSets';
import { smoothTrack } from './smoothTrack';

export type OrbitOffset = { yaw: number; pitch: number };

type Offset = [number, number, number];

type CameraKey = { chapter: PromoChapterId; beat: number; set: Point; position: Offset; target: Offset };

const handheld = { amplitude: 0.12, speed: 0.35 };

const { signal, map, board, app } = promoSets;

const cameraKeys: CameraKey[] = [
	{ chapter: 'signal', beat: 0, set: signal, position: [0, 0.3, 17], target: [0, 0, 0] },
	{ chapter: 'signal', beat: 7.6, set: signal, position: [0, 0.1, 6.8], target: [0, 0, 0] },
	{ chapter: 'noise', beat: 4, set: signal, position: [6, 3, 21], target: [0, 0, 0] },
	{ chapter: 'noise', beat: 9, set: signal, position: [-7, 5, 23], target: [0, -1, 0] },
	{ chapter: 'map', beat: 2, set: map, position: [-3, 30, 31], target: [0, 0, 3] },
	{ chapter: 'map', beat: 7, set: map, position: [0, 33, 29], target: [0, 0, 2] },
	{ chapter: 'map', beat: 11.5, set: map, position: [0, 18, 6], target: [0, 6, -30] },
	{ chapter: 'board', beat: 1.5, set: board, position: [-15, 3.5, 22], target: [-14, 3, 0] },
	{ chapter: 'board', beat: 7, set: board, position: [-3, 3.5, 21], target: [-3, 3, 0] },
	{ chapter: 'board', beat: 12, set: board, position: [11, 3.5, 21], target: [12, 3, 0] },
	{ chapter: 'board', beat: 17, set: board, position: [2, 4, 40], target: [0, 1.5, 0] },
	{ chapter: 'board', beat: 19.5, set: board, position: [0, 10, 34], target: [0, 16, 0] },
	{ chapter: 'app', beat: 3, set: app, position: [0, 0.5, 34], target: [0, 0, 0] },
	{ chapter: 'app', beat: 7, set: app, position: [-1, -1.5, 21], target: [0, -2.5, 0] },
	{ chapter: 'app', beat: 10.5, set: app, position: [2.5, -1, 26], target: [6, -1.5, 10] },
	{ chapter: 'app', beat: 14.5, set: app, position: [4, -1.2, 23.5], target: [6.8, -1.5, 10] },
	{ chapter: 'launch', beat: 4.5, set: app, position: [0, 18, 110], target: [0, 0, 0] },
	{ chapter: 'launch', beat: 7.6, set: app, position: [0, 2, 30], target: [0, 0, 0] },
	{ chapter: 'brand', beat: 1, set: app, position: [0, 0.5, 21], target: [0, -1.9, 0] },
	{ chapter: 'brand', beat: 16, set: app, position: [0, 0.4, 18], target: [0, -1.9, 0] }
];

const keyTimes = cameraKeys.map((key) => chapterBeat(key.chapter, key.beat));
const positionTrack = smoothTrack(keyTimes, cameraKeys.map((key) => offsetFrom(key.set, ...key.position)));
const targetTrack = smoothTrack(keyTimes, cameraKeys.map((key) => offsetFrom(key.set, ...key.target)));

function handheldSway(seconds: number): Vector3 {
	const phase = seconds * handheld.speed;
	const across = Math.sin(phase * 1.3) * handheld.amplitude;
	const upward = Math.sin(phase * 0.9 + 1) * handheld.amplitude;
	return new Vector3(across, upward, 0);
}

/** Puts the camera where the film has it at this moment, turned by however far the viewer has dragged. */
export function placeCamera(camera: PerspectiveCamera, seconds: number, orbit: OrbitOffset): void {
	const target = targetTrack(seconds);
	const position = positionTrack(seconds);
	const fromTarget = position.sub(target);
	fromTarget.applyAxisAngle(camera.up, orbit.yaw);
	const pitchAxis = fromTarget.clone().cross(camera.up).normalize();
	fromTarget.applyAxisAngle(pitchAxis, orbit.pitch);
	camera.position.copy(target).add(fromTarget).add(handheldSway(seconds));
	camera.lookAt(target);
}
