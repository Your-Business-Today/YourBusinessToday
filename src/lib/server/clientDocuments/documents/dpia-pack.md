# DPIA Pack

**Internal — Your Business Today Ltd — Version 1.0 — 17 November 2026**

What YBT gives a client who is carrying out a data protection impact assessment on a Solution YBT builds and runs, or on the data it keeps in YBT's Platform at yourbusiness.today. It is the pack promised in section 2.6 of Schedule 1 (Data Processing Agreement). The client is the controller and writes its own DPIA; this pack gives it YBT's side of the facts. Fill in the bracketed parts for the client before sending it.

## 1. The processing

| | |
| --- | --- |
| Client | [Client legal name] |
| What the Solution does | [One paragraph from the Order Forms: what the client's people use it for.] |
| Personal data | As in Schedule 1, Annex A, for this client: [names; work contact details; job titles; records of work, messages and files; sign-in and access logs; anything specific]. |
| Special category or criminal offence data | [None. If any, list it and the additional measures agreed.] |
| People it is about | [The client's staff and contractors; its customers and suppliers; others named in its records.] |
| Who decides | The client decides why the data is processed and how long it is kept. YBT decides the technical means on its behalf. |

## 2. How the data moves

1. The client's users sign in to the Solution, or to the Platform, and put records and files in. Everything travels over TLS 1.2 or higher.
2. The Solution stores them in its own database and file storage, in the client's own Microsoft Azure subscription. Platform data is stored by Supabase in London.
3. Backups are taken automatically and replicated to the paired Azure region.
4. The Solution sends email through Resend only where it sends email, such as notifications.
5. The Solution and the Platform send nothing to an AI model themselves. YBT's people build and support the Solution with Claude sessions that can read the data the work needs, with no more access than the person using them, and with a model YBT runs on its own computer that sends nothing out.
6. Where the client's own users connect their AI assistant through YBT's connector, it reads and writes only what that user could, under that user's sign-in and the client's own AI account.
7. The client exports its data whenever it wants, and when the engagement ends YBT returns it and deletes it under Schedule 4.

## 3. Where it is held and who processes it

- **Hosting:** the Azure regions in the client's Order Form, in the United Kingdom or the European Economic Area: [region of the database, and of the web front end if different; paired backup region]. Platform data: London, United Kingdom.
- **Sub-processors:** as in Schedule 1, Annex C, for this client: [list the ones in use].
- **Transfers:** Microsoft, Supabase and Vercel support staff may reach the data from outside the United Kingdom, and Anthropic and Resend are in the United States. Each is covered by the provider's data processing terms with the UK Addendum, and assessed in YBT's Transfer Risk Assessment, which YBT will share with the client on request.

## 4. Security

The measures are those in Schedule 1, Annex B: a separate Azure subscription, database and credentials for each client; least-privilege access for named people with multi-factor authentication; encryption in transit and at rest, backups included; logging; geo-redundant backups with six-monthly restore tests; automated checks on every change before release, and security updates within 14 days for critical ones; and one client at a time in every AI session.

## 5. Retention and deletion

- Live records: as the client decides; by default kept while the Solution is live.
- Backups: point-in-time for 35 days; weekly for 12 weeks; monthly for 12 months.
- Logs: application logs at least 30 days; Azure activity log 90 days.
- At the end: a final export, then deletion from the live Solution within 30 days of delivering it, with a certificate. Long-term backups are deleted with the live Solution and point-in-time backups expire within 35 days. Erasure of one person follows the Data Subject Requests and Erasure Procedure, with a suppression list so a restore never brings them back.

## 6. Risks YBT sees, and what reduces them

| Risk to the people in the data | What reduces it | Left over |
| --- | --- | --- |
| One client's data reaches another client | A separate subscription, database and credentials per client; AI sessions work on one client at a time | Low |
| An account with access is taken over | Multi-factor authentication on every privileged account; access removed the day someone stops; breach procedure with 24-hour notice to the client | Low |
| Data is lost | Geo-redundant backups, tested restores, recovery targets in Schedule 2 | Low |
| Data is read from outside the UK | Provider data processing terms with the UK Addendum; the Transfer Risk Assessment | Low |
| An AI session reads more than the work needs | The session has no more access than the person using it, on one client at a time | Low |
| Client data is used to train an AI model | Client Data is never used for training (MSA clauses 9.6 and 10.3) [and YBT's people work on it only in Claude accounts where model training is off — to confirm] | [To assess once confirmed] |
| The client cannot get its data back if YBT stops | Self-service export, a monthly continuity copy to storage the client owns, step-in under Schedule 4 | Low |

## 7. Contact

Jeremy Ferendinos, Director, consulting@yourbusiness.today. YBT has no Data Protection Officer, for the reason in the Processor Position and Records of Processing.
