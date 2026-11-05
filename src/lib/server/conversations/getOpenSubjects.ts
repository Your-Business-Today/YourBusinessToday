export type SubjectKind = 'goal' | 'task';

/** A goal or task still open on one of the reader's projects, as far as a list of who to chase needs it. */
export type OpenSubject = { kind: SubjectKind; id: string; title: string; projectName: string };
