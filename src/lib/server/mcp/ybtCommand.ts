/** A command the person types in chat as /ybt-<name>, or picks from their Claude's prompt menu: what it asks their Claude to do. */
export type YbtCommand = { name: string; title: string; description: string; text: string };
