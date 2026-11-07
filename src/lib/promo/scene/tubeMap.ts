import { Group, type Scene } from 'three';
import { beatsInto } from '../promoTimeline';
import { mix, progressBetween, smoothStep } from '../promoMotion';
import { createFadeGroup } from './fadeGroup';
import { createGlowTexture } from './glowTexture';
import { createMapGround } from './mapGround';
import type { PromoPalette } from './promoPalette';
import { createMapStations } from './tubeMapStations';
import { createMapTrack } from './tubeMapTrack';
import { mapLines } from './tubeMapLayout';

export type TubeMap = { update: (seconds: number) => void };

const arrival = { startBeat: -2, endBeat: 0.5 };
const dimming = { startBeat: 0, endBeat: 3, dimmedTo: 0.28 };
const departure = { startBeat: 6, endBeat: 9 };

/** How strongly the map shows: it rises as the noise falls onto it and dims once the camera flies on to the board. */
function mapPresenceAt(seconds: number): number {
	const arrived = smoothStep(progressBetween(beatsInto('map', seconds), arrival.startBeat, arrival.endBeat));
	const boardBeats = beatsInto('board', seconds);
	const dimmed = mix(1, dimming.dimmedTo, smoothStep(progressBetween(boardBeats, dimming.startBeat, dimming.endBeat)));
	const gone = smoothStep(progressBetween(boardBeats, departure.startBeat, departure.endBeat));
	return arrived * dimmed * (1 - gone);
}

/** The business drawn as a tube map: its flows of information as coloured lines, its hand-offs as stations. */
export function createTubeMap(scene: Scene, palette: PromoPalette): TubeMap {
	const group = new Group();
	const fades = createFadeGroup();
	const glow = createGlowTexture();
	createMapGround(group, palette, fades);
	const tracks = mapLines.map((line) =>
		createMapTrack(line, { colour: palette.lines[line.colourIndex], glow, group, fades })
	);
	const stations = createMapStations(group, palette, fades);
	scene.add(group);
	const update = (seconds: number) => {
		const presence = mapPresenceAt(seconds);
		group.visible = presence > 0;
		fades.setPresence(presence);
		tracks.forEach((track) => track.update(seconds));
		stations.update(seconds, presence);
	};
	return { update };
}
