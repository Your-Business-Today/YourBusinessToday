import { describe, expect, it } from 'vitest';
import { encodeWav } from './wavFile';

const sampleRate = 44100;
const headerBytes = 44;
const bytesPerSample = 2;
const labelBytes = 4;

function audioBufferOf(channels: number[][]): AudioBuffer {
	const [firstChannel] = channels;
	const getChannelData = (channel: number) => Float32Array.from(channels[channel]);
	return { numberOfChannels: channels.length, sampleRate, length: firstChannel.length, getChannelData } as unknown as AudioBuffer;
}

function labelAt(view: DataView, offset: number): string {
	return String.fromCharCode(...new Uint8Array(view.buffer, offset, labelBytes));
}

describe('the soundtrack as a WAV file', () => {
	it('writes a 16-bit PCM header for the channels and rate it was given', () => {
		const view = new DataView(encodeWav(audioBufferOf([[0, 0], [0, 0]])));
		const dataBytes = 2 * 2 * bytesPerSample;
		expect([labelAt(view, 0), labelAt(view, 8), labelAt(view, 36)]).toEqual(['RIFF', 'WAVE', 'data']);
		expect(view.getUint16(22, true)).toBe(2);
		expect(view.getUint32(24, true)).toBe(sampleRate);
		expect(view.getUint16(34, true)).toBe(16);
		expect(view.getUint32(40, true)).toBe(dataBytes);
		expect(view.byteLength).toBe(headerBytes + dataBytes);
	});

	it('interleaves the channels and holds samples that are too loud at full scale', () => {
		const view = new DataView(encodeWav(audioBufferOf([[0.5, 2], [-0.5, -2]])));
		const samples = [0, 1, 2, 3].map((index) => view.getInt16(headerBytes + index * bytesPerSample, true));
		expect(samples).toEqual([16384, -16383, 32767, -32767]);
	});
});
