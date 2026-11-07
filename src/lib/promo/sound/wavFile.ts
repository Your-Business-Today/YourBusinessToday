const bytesPerSample = 2;
const headerBytes = 44;
const bitsPerSample = 16;
const loudestSample = 0x7fff;
const pcmFormat = 1;
const formatChunkBytes = 16;

function writeText(view: DataView, offset: number, text: string): void {
	[...text].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
}

function writeHeader(view: DataView, buffer: AudioBuffer, dataBytes: number): void {
	const { numberOfChannels, sampleRate } = buffer;
	writeText(view, 0, 'RIFF');
	view.setUint32(4, headerBytes - 8 + dataBytes, true);
	writeText(view, 8, 'WAVEfmt ');
	view.setUint32(16, formatChunkBytes, true);
	view.setUint16(20, pcmFormat, true);
	view.setUint16(22, numberOfChannels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
	view.setUint16(32, numberOfChannels * bytesPerSample, true);
	view.setUint16(34, bitsPerSample, true);
	writeText(view, 36, 'data');
	view.setUint32(40, dataBytes, true);
}

/** The soundtrack as a 16-bit WAV file, its channels interleaved, ready to be muxed into the film. */
export function encodeWav(buffer: AudioBuffer): ArrayBuffer {
	const { numberOfChannels, length } = buffer;
	const dataBytes = length * numberOfChannels * bytesPerSample;
	const view = new DataView(new ArrayBuffer(headerBytes + dataBytes));
	writeHeader(view, buffer, dataBytes);
	const channels = Array.from({ length: numberOfChannels }, (_, channel) => buffer.getChannelData(channel));
	for (let index = 0; index < length; index += 1) {
		channels.forEach((samples, channel) => {
			const sample = Math.max(-1, Math.min(1, samples[index]));
			const offset = headerBytes + (index * numberOfChannels + channel) * bytesPerSample;
			view.setInt16(offset, Math.round(sample * loudestSample), true);
		});
	}
	return view.buffer;
}
