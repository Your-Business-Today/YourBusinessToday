const ignoreRefusal = () => undefined;

/** Keeps a clip or the music at the film's time: brought back when it drifts or while paused, and playing as the film plays. */
export function keepMediaAt(media: HTMLMediaElement, seconds: number, isPlaying: boolean, allowedDriftSeconds: number): void {
	const drift = Math.abs(media.currentTime - seconds);
	const isDrifting = drift > allowedDriftSeconds;
	if (isDrifting || !isPlaying) media.currentTime = seconds;
	const isToStart = isPlaying && media.paused;
	if (isToStart) startPlaying(media);
	const isToStop = !isPlaying && !media.paused;
	if (isToStop) media.pause();
}

function startPlaying(media: HTMLMediaElement): void {
	const playing = media.play();
	playing.catch(ignoreRefusal);
}
