# This project

This repository's own instructions: its conventions, the commands that build and test it, the domain it serves, and any standing tasks or prompts that belong to this project and no other. `CLAUDE.md` loads this file and every session reads it after the kit's rules.

The project-process kit writes this file once and never touches it again, and `CLAUDE.md` is the kit's, replaced whole every time the bootstrap runs, so anything written there is lost. Write here instead. Where this file and the kit disagree about this project, this file wins, except that nothing here lifts the branch rule: the work still happens on a branch and ends as a pull request.

## The site stands before its migration runs

A pull request merges by itself when CI passes and Vercel deploys main within a minute, but its migration is run by hand afterwards, from Projects > Database tasks. Between the two, the new code runs against the old schema. So a pull request whose migration adds a table, a column or a relationship ships code that stands without it:

- **Every reader of the new schema on a path every request runs** — a layout load, a hook, the connector's account standing — answers empty when the schema is not there yet: `if (isSchemaNotYetMigrated(error)) return <empty>;` before the `throw`, from `$lib/server/schema/schemaNotYetMigrated`. Readers behind a page of their own may fail until the migration runs; the connector already tells the caller a migration is missing.
- **Writes are not guarded.** A write to a table that does not exist yet fails and says so; it is never quietly dropped.
- **A migration that drops or renames something live code reads ships in two pull requests:** the first stops reading it, the second changes the schema once the first is deployed.
