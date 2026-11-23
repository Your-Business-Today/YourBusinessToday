import { chatWhiteboardLimits, type WhiteboardItem } from '$lib/data/chat/chatWhiteboardRules';
import { drawBoard, type BoardPalette } from './whiteboardRendering';

const pictureType = 'image/png';
const couldNotDraw = 'The board could not be drawn as a picture in this browser.';

/** The board drawn afresh at its own size, with no mark of where text was about to go, as a PNG file of that name. */
export async function boardPicture(items: WhiteboardItem[], palette: BoardPalette, fileName: string): Promise<File | string> {
	const canvas = document.createElement('canvas');
	canvas.width = chatWhiteboardLimits.boardWidth;
	canvas.height = chatWhiteboardLimits.boardHeight;
	const context = canvas.getContext('2d');
	if (context === null) return couldNotDraw;
	drawBoard(context, items, palette, null);
	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, pictureType));
	if (blob === null) return couldNotDraw;
	return new File([blob], fileName, { type: pictureType });
}
