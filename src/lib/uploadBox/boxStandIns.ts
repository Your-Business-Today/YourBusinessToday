const megabyte = 1024 * 1024;

/** A box opened on a task, as the connector describes one, for the tests of what the box does with a file. */
export const openBox = {
	taskId: 'task-1',
	taskTitle: 'FIX: invoice total is rounded up',
	uploadPage: 'https://yourbusiness.today/upload/abc.def',
	largestFile: '25.0 MB',
	largestFileBytes: 25 * megabyte,
	largestRelayedFileBytes: 3 * megabyte
};

export function fileOfBytes(bytes: number[], name = 'grid.png', type = 'image/png'): File {
	return new File([new Uint8Array(bytes)], name, { type });
}

export function fileOfSize(byteCount: number, name: string, type = 'image/png'): File {
	return new File([new Uint8Array(byteCount)], name, { type });
}
