import boxEvents from '$lib/uploadBox/boxEvents.js?raw';
import boxFiles from '$lib/uploadBox/boxFiles.js?raw';
import boxLook from '$lib/uploadBox/boxLook.js?raw';
import boxMain from '$lib/uploadBox/boxMain.js?raw';
import boxMarkup from '$lib/uploadBox/uploadBox.html?raw';
import boxRequests from '$lib/uploadBox/boxRequests.js?raw';
import boxSteps from '$lib/uploadBox/boxSteps.js?raw';
import boxStyles from '$lib/uploadBox/uploadBox.css?raw';
import boxUploads from '$lib/uploadBox/boxUploads.js?raw';
import boxView from '$lib/uploadBox/boxView.js?raw';
import hostChannel from '$lib/uploadBox/hostChannel.js?raw';

/** In the order they run: a module comes after every module whose values it reads as it loads. */
export const uploadBoxModules = [
	hostChannel,
	boxFiles,
	boxSteps,
	boxUploads,
	boxView,
	boxLook,
	boxEvents,
	boxRequests,
	boxMain
];

const stylesSlot = '/*upload-box-styles*/';
const scriptSlot = '/*upload-box-script*/';
const importStatement = /^import\b[^;]*;\n/gm;
const exportKeyword = /^export /gm;

/**
 * A host's sandbox loads nothing from anywhere else, so the box is one self-contained page: its
 * modules share a single script here, and their import and export lines come off as they join.
 */
export function asOneScript(modules: string[]): string {
	return modules
		.map((module) => module.replace(importStatement, '').replace(exportKeyword, ''))
		.join('\n');
}

export const uploadBoxDocument = boxMarkup
	.replace(stylesSlot, () => boxStyles)
	.replace(scriptSlot, () => asOneScript(uploadBoxModules));
