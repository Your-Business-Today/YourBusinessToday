import type { PerspectiveCamera } from 'three';

const sharesNoCover = 0;

/** Keeps the brain's centre in the part of the screen no panel covers, so an opened page's neuron is never under its own panel. */
export class CoverClearance {
	private clearedFor = '';

	keepClear(camera: PerspectiveCamera, widthPixels: number, heightPixels: number, coverWidthPixels: number): void {
		const clearing = `${widthPixels}x${heightPixels}-${coverWidthPixels}`;
		if (clearing === this.clearedFor) return;
		this.clearedFor = clearing;
		if (coverWidthPixels === sharesNoCover) camera.clearViewOffset();
		if (coverWidthPixels !== sharesNoCover) camera.setViewOffset(widthPixels, heightPixels, coverWidthPixels / 2, 0, widthPixels, heightPixels);
		camera.updateProjectionMatrix();
	}
}
