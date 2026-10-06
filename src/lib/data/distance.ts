export type Coordinates = { latitude: number; longitude: number };

const earthRadiusMiles = 3958.8;
const hereWithinMiles = 0.1;

export function distanceInMiles(from: Coordinates, to: Coordinates): number {
	const latitudeDelta = toRadians(to.latitude - from.latitude);
	const longitudeDelta = toRadians(to.longitude - from.longitude);
	const halfChord =
		Math.sin(latitudeDelta / 2) ** 2 +
		Math.cos(toRadians(from.latitude)) *
			Math.cos(toRadians(to.latitude)) *
			Math.sin(longitudeDelta / 2) ** 2;
	return 2 * earthRadiusMiles * Math.asin(Math.sqrt(halfChord));
}

export function describeDistance(miles: number): string {
	if (miles < hereWithinMiles) return 'here';
	return `${miles.toFixed(1)} mi`;
}

function toRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}
