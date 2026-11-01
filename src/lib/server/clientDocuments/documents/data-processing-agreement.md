# Schedule 1 — Data Processing Agreement

**Version 1.1 — 1 November 2026**

This schedule forms part of the Master Services Agreement between Your Business Today Ltd ("**YBT**") and [Client legal name] (the "**Client**"). It is the contract required by Article 28(3) of the UK GDPR. Where it conflicts with anything else in the agreement about personal data, this schedule wins.

## 1. Roles

1.1 The Client is the controller of the personal data in the Client Data, and YBT is its processor. The details of the processing — its subject matter, duration, nature and purpose, the types of personal data and the categories of data subject — are in Annex A.

1.2 The Client decides why the personal data is processed and how long it is kept. YBT decides the technical means — hosting, security, storage, retrieval and deletion — on the Client's behalf.

1.3 YBT will not use the personal data for its own purposes. In particular it will not use it for analytics, benchmarking, product development, case studies or training any AI model, and it will not combine it with another client's data.

1.4 The Client is responsible for having a lawful basis for the processing, for the instructions it gives, and for the data it provides being accurate and lawfully obtained.

## 2. YBT's obligations

YBT will:

2.1 **Instructions.** Process the personal data only on the Client's documented instructions — which are the agreement, each Order Form, and the Client's use of the Solution's features — including as to international transfers, unless the law requires otherwise (in which case YBT will tell the Client first, unless the law forbids it). YBT will tell the Client immediately if it thinks an instruction breaks data protection law.

2.2 **Confidentiality.** Ensure that everyone YBT authorises to process the personal data — employees, contractors or agency staff — is under a duty of confidence.

2.3 **Security.** Take the technical and organisational measures required by Article 32 of the UK GDPR. The measures are described in Annex B. YBT may improve them but will not reduce the overall level of protection.

2.4 **Sub-processors.** Meet the conditions in section 3.

2.5 **Data subject rights.** Taking into account the nature of the processing, help the Client by appropriate technical and organisational measures to respond to requests from individuals exercising their rights. YBT will pass any request it receives directly to the Client within two Business Days and will not respond to it except on the Client's instruction. On the Client's instruction, YBT will find, export, correct or delete an individual's personal data across the Solution within five Business Days, and will make sure a restore from backup does not bring deleted records back.

2.6 **Assistance.** Help the Client meet its obligations on security, notifying personal data breaches to the Information Commissioner and to individuals, data protection impact assessments and prior consultation, taking into account the nature of the processing and the information available to YBT. YBT keeps a DPIA pack ready for this: a description of the processing and data flows, hosting locations, sub-processors, security measures, retention and deletion mechanics and transfer mechanisms.

2.7 **Breach notification.** Notify the Client without undue delay, and in any event within 24 hours, after becoming aware of a personal data breach affecting the Client's personal data, with the information set out in Annex B, section 8, as it becomes available. The Client's own 72-hour period for notifying the Information Commissioner runs from the time YBT tells it, so YBT treats this as urgent.

2.8 **End of the agreement.** At the Client's choice, return all the personal data to the Client and then delete it, including existing copies, in accordance with Schedule 4 (Exit and Continuity), unless the law requires YBT to keep it.

2.9 **Information and audit.** Make available to the Client all information necessary to demonstrate compliance with Article 28, and allow for and contribute to audits and inspections by the Client or an auditor it appoints, on 30 days' notice, no more than once a year (or at any time following a personal data breach or a regulator's request), during business hours and subject to confidentiality. YBT cannot grant audit access to Microsoft's data centres. For those, the Client accepts Microsoft's independent certifications and audit reports, available through Microsoft's Service Trust Portal, which YBT will obtain on request.

2.10 **Records.** Keep the record of processing activities required by Article 30(2) of the UK GDPR for the processing it carries out for the Client.

## 3. Sub-processors

3.1 The Client gives YBT general authorisation to use the sub-processors listed in Annex C.

3.2 YBT will give the Client at least 30 days' written notice before adding or replacing a sub-processor, except where a sub-processor makes a change on shorter notice to YBT, in which case YBT will give as much notice as it received. The Client may object in writing on reasonable data protection grounds within that notice period. If it does, the parties will discuss it in good faith. If they cannot resolve it, YBT may either not use that sub-processor for the Client's personal data or, if that is not practical, the Client may end the affected services without penalty on written notice.

3.3 YBT will put a written contract in place with each sub-processor imposing data protection obligations that give the same level of protection as this schedule.

3.4 YBT remains fully liable to the Client for the performance of each sub-processor's obligations.

## 4. International transfers

4.1 The Client's personal data is hosted in the Microsoft Azure regions the Order Form names. They are in the United Kingdom or the European Economic Area, and backups are replicated to the region Azure pairs with the one the database runs in. Hosting in the European Economic Area is covered by the United Kingdom's adequacy regulations, so it needs no further transfer safeguard.

4.2 Some sub-processors in Annex C may access personal data from outside the United Kingdom, including for support. Where they do, YBT will make sure the transfer is covered by UK adequacy regulations or by the International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses, supported by a documented transfer risk assessment.

## 5. Liability

5.1 Each party's liability under this schedule is subject to the limits in clause 12 of the Master Services Agreement.

---

## Annex A — Details of the processing

|                                           |                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject matter                            | Hosting and operating the Solution built for the Client, and providing the services in each Order Form.                                                                                                                                                                                |
| Duration                                  | For the term of the agreement, and afterwards until the data is returned and deleted under Schedule 4.                                                                                                                                                                                 |
| Nature of the processing                  | Collection through the Solution, storage, hosting, backup, retrieval, organisation, display, transmission, export, correction and deletion; and, where the Order Form says so, sending records to an AI service to generate text from them.                                            |
| Purpose                                   | To provide the Solution and the services to the Client.                                                                                                                                                                                                                                |
| Types of personal data                    | [Names; work contact details (email, phone); job titles; records of work done, messages and files that the Client's users put into the Solution; sign-in and access logs. Add anything specific to this client.]                                                                       |
| Special category or criminal offence data | [None. If the Solution will hold any, list it here and the additional measures agreed.]                                                                                                                                                                                                |
| Categories of data subject                | [The Client's staff and contractors; the Client's customers and suppliers; other people named in records the Client keeps in the Solution.]                                                                                                                                            |
| Retention                                 | As set by the Client. By default, records are kept while the Solution is live and deleted under Schedule 4 when the agreement ends. Point-in-time backups expire 35 days after they are taken; weekly long-term backups after 12 weeks, and monthly long-term backups after 12 months. |

## Annex B — Security measures

1. **Separation between clients.** Each client's Solution runs in its own Azure subscription with its own database, storage and credentials. No sign-in or administrative session spans more than one client.
2. **Access control.** Access is on a least-privilege basis and granted to named individuals only. Every administrative and privileged account uses multi-factor authentication. Access is removed on the day someone stops working on the Client's Solution.
3. **Encryption.** Data is encrypted in transit (TLS 1.2 or higher) and at rest, including in backups, using Azure platform encryption.
4. **Logging.** Changes to production are recorded in the Azure activity log and kept for 90 days. The Solution's application logs, including sign-ins to the Solution, are kept for at least 30 days.
5. **Backups and recovery.** Automated backups are geo-redundant, replicated to the paired Azure region, and kept for 35 days for point-in-time restore, with weekly backups kept for 12 weeks and monthly backups for 12 months. Restores are tested at least every six months, and each test is recorded against the recovery targets in Schedule 2.
6. **Secure development and updates.** Code is reviewed by a person before release. Security updates are applied to the platform and dependencies promptly, and critical ones within 14 days.
7. **Staff.** Everyone with access is bound by confidentiality and briefed on this schedule and the breach procedure.
8. **Breach notification content.** A notification under section 2.7 will describe, as far as known: the nature of the breach, the categories and approximate number of individuals and records concerned, the likely consequences, the measures taken or proposed to deal with it, and a contact at YBT. Further information will follow as it becomes available.
9. **Certification.** YBT holds, or is working towards, Cyber Essentials certification.

## Annex C — Sub-processor register

| Sub-processor                                          | What it does for the Solution                                                              | Where the data is                                                                                                                                  | Transfer safeguard                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Microsoft Ireland Operations Limited (Microsoft Azure) | Hosting, database, file storage, backups and monitoring                                    | The United Kingdom or the European Economic Area, in the regions the Order Form names. Microsoft support staff may access remotely from elsewhere. | Microsoft Products and Services Data Protection Addendum, including the UK Addendum                         |
| Anthropic, PBC                                         | AI text generation from records — only where the Order Form says AI services are used      | United States                                                                                                                                      | Anthropic's data processing addendum with the UK Addendum. Anthropic does not train its models on API data. |
| Resend, Inc.                                           | Sending the Solution's emails, such as notifications — only where the Solution sends email | United States                                                                                                                                      | Resend's data processing agreement with the UK Addendum                                                     |

_Last updated 1 November 2026. YBT keeps this register current and gives notice of changes under section 3.2._

## Signed

|           | For Your Business Today Ltd | For [Client legal name] |
| --------- | --------------------------- | ----------------------- |
| Signature |                             |                         |
| Name      | Nigel Reilly                | [Name]                  |
| Date      |                             |                         |
