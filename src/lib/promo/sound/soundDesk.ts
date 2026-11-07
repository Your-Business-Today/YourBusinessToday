import { randomSigned, seededRandom } from '../promoRandom';

/** Where every voice of the score plays into: straight to the mix, into the hall's reverb, or into the echo. */
export type SoundDesk = { context: BaseAudioContext; dry: AudioNode; hall: AudioNode; echo: AudioNode; noise: AudioBuffer };

const masterLevel = 0.8;
const squeeze = { threshold: -14, knee: 8, ratio: 3.5, attack: 0.004, release: 0.25 };
const hallShape = { seconds: 3.2, fade: 3.4, level: 0.55 };
const echoShape = { delaySeconds: 0.375, feedback: 0.32, tone: 2600, level: 0.35 };
const noiseSeed = 5;
const noiseSeconds = 2;
const stereoChannels = 2;

function hallImpulse(context: BaseAudioContext): AudioBuffer {
	const length = Math.round(hallShape.seconds * context.sampleRate);
	const impulse = context.createBuffer(stereoChannels, length, context.sampleRate);
	const random = seededRandom(noiseSeed);
	for (let channel = 0; channel < stereoChannels; channel += 1) {
		const samples = impulse.getChannelData(channel);
		samples.forEach((_, index) => {
			samples[index] = randomSigned(random, 1) * (1 - index / length) ** hallShape.fade;
		});
	}
	return impulse;
}

function whiteNoise(context: BaseAudioContext): AudioBuffer {
	const length = noiseSeconds * context.sampleRate;
	const buffer = context.createBuffer(1, length, context.sampleRate);
	const samples = buffer.getChannelData(0);
	const random = seededRandom(noiseSeed);
	samples.forEach((_, index) => {
		samples[index] = randomSigned(random, 1);
	});
	return buffer;
}

function createEcho(context: BaseAudioContext, mix: AudioNode): AudioNode {
	const input = new GainNode(context, { gain: echoShape.level });
	const delay = new DelayNode(context, { delayTime: echoShape.delaySeconds, maxDelayTime: 1 });
	const feedback = new GainNode(context, { gain: echoShape.feedback });
	const tone = new BiquadFilterNode(context, { type: 'lowpass', frequency: echoShape.tone });
	input.connect(delay).connect(tone).connect(feedback).connect(delay);
	tone.connect(mix);
	return input;
}

/** The mixing desk the whole score runs through: a gentle squeeze on the master, a hall and a dotted-eighth echo. */
export function createSoundDesk(context: BaseAudioContext): SoundDesk {
	const master = new GainNode(context, { gain: masterLevel });
	const squeezer = new DynamicsCompressorNode(context, squeeze);
	squeezer.connect(master).connect(context.destination);
	const dry = new GainNode(context);
	dry.connect(squeezer);
	const hall = new GainNode(context, { gain: hallShape.level });
	hall.connect(new ConvolverNode(context, { buffer: hallImpulse(context) })).connect(squeezer);
	return { context, dry, hall, echo: createEcho(context, squeezer), noise: whiteNoise(context) };
}
