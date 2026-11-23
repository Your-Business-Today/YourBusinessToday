/**
 * The limits on a whiteboard in a room, stated once and mirrored by the checks on migration 0278's columns. The board
 * has a fixed size of its own, and every point on it is a whole number of the board's units, whatever the screen.
 */
export const chatWhiteboardLimits = {
	longestTitle: 120,
	boardWidth: 1600,
	boardHeight: 900,
	mostItemsOnABoard: 500,
	mostPointsInAStroke: 1000,
	longestText: 200,
	largestDrawingBytes: 500_000,
	latestBoardsListed: 100
} as const;

/** What a hand holds over the board: a pen draws, the eraser takes off whole items it touches, text places words. */
export const whiteboardTools = { pen: 'pen', eraser: 'eraser', text: 'text' } as const;

export type WhiteboardTool = (typeof whiteboardTools)[keyof typeof whiteboardTools];

/** The tools that leave something on the board; the eraser leaves nothing, so no item is ever an eraser's. */
export const whiteboardMarkingTools: readonly string[] = [whiteboardTools.pen, whiteboardTools.text];

/** The board's palette, each colour drawn in a colour of the site's theme. */
export const whiteboardColours = ['black', 'red', 'blue', 'green', 'amber'] as const;

export type WhiteboardColour = (typeof whiteboardColours)[number];

/** How wide a pen draws, in the board's units. */
export const whiteboardPenWidths = [3, 6, 12, 24] as const;

/** How large text is written, in the board's units. */
export const whiteboardTextSizes = [28, 40, 56] as const;

/** A place on the board: across and down, in whole units from its top left corner. */
export type WhiteboardPoint = [number, number];

/** A line drawn with the pen. */
export type WhiteboardStroke = { tool: typeof whiteboardTools.pen; colour: WhiteboardColour; width: number; points: WhiteboardPoint[] };

/** Words placed on the board, their first letter's baseline at the point. */
export type WhiteboardText = { tool: typeof whiteboardTools.text; colour: WhiteboardColour; size: number; at: WhiteboardPoint; text: string };

export type WhiteboardItem = WhiteboardStroke | WhiteboardText;

/** One board of a room, as chat_whiteboards keeps it. */
export type ChatWhiteboard = {
	id: string;
	roomId: string;
	title: string;
	lastSavedByAccountId: string;
	createdByAccountId: string;
	createdAt: string;
	updatedAt: string;
};

/** A board as the room lists it and the board page opens it: who saved it last named. */
export type ListedChatWhiteboard = ChatWhiteboard & { lastSavedByName: string };

/** A board opened to draw on: its items too. */
export type OpenedChatWhiteboard = ListedChatWhiteboard & { items: WhiteboardItem[] };

/** A board as it is asked to be saved: its title, its items, and when it had last been saved as the saver opened it. */
export type ChatWhiteboardSaving = { title: string; items: WhiteboardItem[]; openedAsSavedAt: string };

const { longestTitle, mostItemsOnABoard, largestDrawingBytes } = chatWhiteboardLimits;

export const chatWhiteboardRefusals = {
	title: `A whiteboard's title is 1 to ${longestTitle} characters.`,
	itemsNotAList: 'strokes is the list of what is on the board, each a pen stroke or a text item.',
	tooManyItems: `strokes holds at most ${mostItemsOnABoard} items; erase some to draw more.`,
	tooManyBytes: `The drawing is larger than ${largestDrawingBytes} bytes, the most a board may hold; erase some to draw more.`,
	openedAsSavedAt: 'openedAsSavedAt is when the board had last been saved as you opened it. Open it again.',
	archivedRoom: 'This room is archived, so no whiteboard can be started or saved in it.',
	noSuchWhiteboard: 'This room has no whiteboard of that id.'
} as const;
