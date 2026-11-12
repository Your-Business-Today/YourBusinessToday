export type PersonNoteKind = 'note' | 'approach' | 'research';

export const personNoteKinds = { note: 'note', approach: 'approach', research: 'research' } as const;

export const personNoteTitles = { note: 'Note', approach: 'Drafted approach', research: 'Found on the web' } as const;
