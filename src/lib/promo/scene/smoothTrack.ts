import { Vector3 } from 'three';

export type SmoothTrack = (seconds: number) => Vector3;

type Segment = { from: number; span: number };

function tangentAt(values: Vector3[], times: number[], index: number): Vector3 {
	const lastIndex = values.length - 1;
	const isEnd = index === 0 || index === lastIndex;
	if (isEnd) return new Vector3();
	const span = times[index + 1] - times[index - 1];
	const after = values[index + 1];
	return after.clone().sub(values[index - 1]).divideScalar(span);
}

function hermiteWeights(amount: number) {
	const squared = amount * amount;
	const cubed = squared * amount;
	return {
		from: 2 * cubed - 3 * squared + 1,
		fromTangent: cubed - 2 * squared + amount,
		to: -2 * cubed + 3 * squared,
		toTangent: cubed - squared
	};
}

function segmentAt(times: number[], seconds: number): Segment {
	const lastSegment = times.length - 2;
	const laterKey = times.findIndex((time) => time > seconds);
	const isPastTheEnd = laterKey === -1;
	const index = isPastTheEnd ? lastSegment : Math.max(0, laterKey - 1);
	return { from: index, span: times[index + 1] - times[index] };
}

/** A path through keyed points that keeps its speed smooth through each key, timed in seconds. */
export function smoothTrack(times: number[], values: Vector3[]): SmoothTrack {
	const tangents = values.map((_, index) => tangentAt(values, times, index));
	const firstTime = times[0];
	const lastTime = times[times.length - 1];
	return (seconds: number) => {
		const clampedSeconds = Math.min(lastTime, Math.max(firstTime, seconds));
		const segment = segmentAt(times, clampedSeconds);
		const amount = (clampedSeconds - times[segment.from]) / segment.span;
		const weights = hermiteWeights(amount);
		const next = segment.from + 1;
		return new Vector3()
			.addScaledVector(values[segment.from], weights.from)
			.addScaledVector(tangents[segment.from], weights.fromTangent * segment.span)
			.addScaledVector(values[next], weights.to)
			.addScaledVector(tangents[next], weights.toTangent * segment.span);
	};
}
