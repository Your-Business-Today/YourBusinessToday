import { liveMoveBeats } from '../boardLayout';
import type { PromoChapterId } from '../promoTimeline';
import { cardMove } from '../scene/boardCardPose';
import { mapStations } from '../scene/tubeMapLayout';
import { playKick } from './drumVoices';
import { playCrash, playImpact, playRiser } from './effectVoices';
import { pentatonic } from './musicalScale';
import { at, spanOf } from './scoreSpans';
import type { SoundDesk } from './soundDesk';
import { playBell } from './toneVoices';

type Hit = { chapter: PromoChapterId; beat: number; impact: number; crash: number };

type Rise = { from: PromoChapterId; fromBeat: number; to: PromoChapterId; toBeat: number; level: number };

const landingBeat = 2.5;
const hits: Hit[] = [
	{ chapter: 'noise', beat: 0, impact: 0.9, crash: 0 },
	{ chapter: 'map', beat: 0, impact: 0.35, crash: 0 },
	{ chapter: 'board', beat: 0, impact: 0.55, crash: 0.12 },
	{ chapter: 'app', beat: 0, impact: 0, crash: 0.1 },
	{ chapter: 'launch', beat: 0.25, impact: 1, crash: 0.18 },
	{ chapter: 'brand', beat: landingBeat, impact: 1.1, crash: 0.16 }
];
const rises: Rise[] = [
	{ from: 'noise', fromBeat: 8, to: 'map', toBeat: 0, level: 0.22 },
	{ from: 'map', fromBeat: 9, to: 'board', toBeat: 0, level: 0.16 },
	{ from: 'board', fromBeat: 17, to: 'app', toBeat: 0, level: 0.16 },
	{ from: 'app', fromBeat: 13, to: 'launch', toBeat: 0, level: 0.2 },
	{ from: 'launch', fromBeat: 4, to: 'brand', toBeat: 0, level: 0.32 }
];
const letterLandings = { beats: [1.3, 1.7, 2.1], level: 0.5 };
const stationPops = { firstBeat: 0.75, beatsApart: 0.32, level: 0.1, length: 1.2 };
const liveBell = { level: 0.13, length: 1.6, firstNote: 5 };
const phoneBells = [
	{ beat: 10, note: 8 },
	{ beat: 11, note: 10 }
];
const phoneBell = { level: 0.1, length: 0.9 };
const finaleBell = { note: pentatonic.length - 1, level: 0.16, length: 4 };

function scoreHits(desk: SoundDesk): void {
	hits.forEach(({ chapter, beat, impact, crash }) => {
		const when = at(chapter, beat);
		if (impact > 0) playImpact(desk, when, impact);
		if (crash > 0) playCrash(desk, when, crash);
	});
	letterLandings.beats.forEach((beat) => playKick(desk, at('brand', beat), letterLandings.level));
	rises.forEach((rise) => playRiser(desk, { ...spanOf(rise.from, rise.fromBeat, rise.to, rise.toBeat), level: rise.level }));
}

function scoreBells(desk: SoundDesk): void {
	mapStations.forEach((_, index) => {
		const when = at('map', stationPops.firstBeat + index * stationPops.beatsApart);
		playBell(desk, { midi: pentatonic[index], when, length: stationPops.length, level: stationPops.level });
	});
	liveMoveBeats.forEach((beat, index) => {
		const midi = pentatonic[(liveBell.firstNote + index) % pentatonic.length];
		playBell(desk, { midi, when: at('board', beat + cardMove.beats), length: liveBell.length, level: liveBell.level });
	});
	phoneBells.forEach(({ beat, note }) => {
		playBell(desk, { midi: pentatonic[note], when: at('app', beat), length: phoneBell.length, level: phoneBell.level });
	});
	const finale = { midi: pentatonic[finaleBell.note], when: at('brand', landingBeat), length: finaleBell.length };
	playBell(desk, { ...finale, level: finaleBell.level });
}

/** The moments the picture hits: impacts and crashes on the big beats, risers into each chapter, and bells as things land. */
export function scoreMoments(desk: SoundDesk): void {
	scoreHits(desk);
	scoreBells(desk);
}
