import { promoDurationSeconds } from '../promoTimeline';
import { scoreMoments } from './scoreMoments';
import { scorePad } from './scorePad';
import { scoreRhythm } from './scoreRhythm';
import { createSoundDesk } from './soundDesk';

const sampleRate = 44100;
const stereoChannels = 2;

/** Plays the whole score into an offline context and hands back the mixed soundtrack, the same on every render. */
export async function renderSoundtrack(): Promise<AudioBuffer> {
	const length = Math.ceil(promoDurationSeconds * sampleRate);
	const context = new OfflineAudioContext({ numberOfChannels: stereoChannels, length, sampleRate });
	const desk = createSoundDesk(context);
	scorePad(desk);
	scoreRhythm(desk);
	scoreMoments(desk);
	return context.startRendering();
}
