# Processor Position and Records of Processing

**Internal — Your Business Today Ltd — Version 1.3 — 16 November 2026**

The short version of how YBT holds client data, written down so the position is fixed and can be shown to a client or the ICO. The last part is the record of processing activities that Article 30(2) of the UK GDPR requires, with one entry per client.

## 1. Our position

YBT builds software for businesses and runs it for them in YBT's own Microsoft Azure, one subscription per client, in Azure regions in the United Kingdom or the European Economic Area.

- For the data in a client's Solution, the data a client keeps in YBT's platform at yourbusiness.today (its Books, Your Business Brain, Boardroom and workflow map), and the documents, exports and files a client hands over during an engagement, **the client is the controller and YBT is the processor.** YBT chooses the technical means — hosting, security, storage, retrieval, deletion — and that does not make it a controller.
- For its own staff, client contacts, billing records and the Engagement Records (the Order Forms, change requests, acceptance notices, invoices, and the projects, tasks, requests and messages through which the work is run in YBT's portal), **YBT is the controller.** That is covered by the privacy statement on the website.

## 2. Standing rules that keep YBT a processor

Breaking any of these would make YBT a controller of client data in its own right, with the liability that comes with it. So YBT never:

1. uses client data for its own analytics, benchmarking, product development or case studies;
2. uses client data to train, or allows it to be used to train, any AI model;
3. combines or compares one client's data with another's;
4. decides for itself how long client data is kept — the client sets retention, and the default is in its Data Processing Agreement.

## 3. Decisions recorded

| Decision                                                                                                                                                                                 | Reason                                                                                                                                                                       | Revisit when                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| No Data Protection Officer is required                                                                                                                                                   | YBT's core activities do not consist of large-scale regular and systematic monitoring of individuals, or large-scale processing of special category or criminal offence data | A client Solution will hold special category data at scale                             |
| Client data is hosted in the Azure regions each client's Order Form names, in the UK or the EEA, with geo-redundant backups in the paired region                                         | The UK's adequacy regulations cover the EEA, so storage there needs no further transfer safeguard                                                                            | A client asks for UK-only hosting, or the UK's adequacy regulations for the EEA change |
| Non-UK access by Microsoft support and US-based sub-processors is covered by Microsoft's and each provider's data protection terms with the UK Addendum, plus a transfer risk assessment | YBT initiates that access, so the duty is YBT's                                                                                                                              | A sub-processor is added, or the law changes                                           |
| Article 30 records are kept even though YBT has fewer than 250 staff                                                                                                                     | Hosting client data is continuous, not occasional, so the exemption does not apply                                                                                           | Never                                                                                  |
| YBT must be registered with the ICO and pay the data protection fee                                                                                                                      | Required of every organisation that controls personal data                                                                                                                   | Renew annually                                                                         |

## 4. ICO registration

|                         |                   |
| ----------------------- | ----------------- |
| ICO registration number | ZC253740          |
| Renewal date            | 20 September 2027 |

## 5. Log of signed processor contracts

The ICO's accountability framework expects YBT to know which data processing agreements it has signed and to review them. Review each one at least once a year.

| Client   | DPA version signed | Date signed | Sub-processors in use | Last reviewed |
| -------- | ------------------ | ----------- | --------------------- | ------------- |
| [Client] | 1.3                |             |                       |               |

## 6. Record of processing activities — Article 30(2)

YBT's details: Your Business Today Ltd, 8 Eastleigh Close, Sutton, England, SM2 6QY — consulting@yourbusiness.today. Contact for data protection: Jeremy Ferendinos, Director. No DPO appointed (see section 3).

Copy this block for each client.

### Client: [Client legal name]

|                                                      |                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller                                           | [Client legal name, address, contact name and email]                                                                                                                                                                                                                                             |
| Controller's representative or DPO (if any)          | [Name and contact, or "none"]                                                                                                                                                                                                                                                                    |
| Categories of processing carried out for this client | Hosting, storage, backup, operation, support and maintenance of the client's Solution; hosting of the data the client keeps in YBT's platform at yourbusiness.today; export and deletion on instruction; [AI text generation from records, if used]                                                                                                                            |
| Transfers outside the UK                             | [Microsoft support access — safeguard: Microsoft DPA with UK Addendum. Anthropic, United States — safeguard: UK Addendum, if AI is used. Resend, United States — safeguard: UK Addendum, if email is sent. Supabase and Vercel support access to YBT's platform at yourbusiness.today, which is hosted in London — safeguard: UK Addendum, if the client keeps data there.]                                                                                      |
| Security measures                                    | As set out in Annex B of the client's Data Processing Agreement: separate subscription, database and credentials per client; least-privilege access with multi-factor authentication; encryption in transit and at rest; access logging; backups replicated to the paired Azure region, which may be in the EEA, with six-monthly restore tests |
| Azure subscription id                                | [id]                                                                                                                                                                                                                                                                                             |
| DPA version and date                                 | [1.3, date]                                                                                                                                                                                                                                                                                      |
| Record last reviewed                                 | [date]                                                                                                                                                                                                                                                                                           |
