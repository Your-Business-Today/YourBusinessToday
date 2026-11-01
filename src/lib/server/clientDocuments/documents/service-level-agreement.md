# Schedule 2 — Service Levels and Support

**Version 1.2 — 1 November 2026**

This schedule forms part of the Master Services Agreement between Your Business Today Ltd ("**YBT**") and [Client legal name] (the "**Client**"). It applies while the Client takes the Run service.

## 1. Availability

1.1 YBT aims to keep the production Solution available 99.5% of the time in each calendar month, measured by YBT's external monitoring.

1.2 Availability is calculated as the minutes in the month, less minutes of unavailability, divided by the minutes in the month. Time excluded under section 5 does not count as unavailability.

## 2. Support

2.1 Support hours are 09:00 to 17:30 UK time on Business Days. Support outside those hours is not included; it can be ordered separately.

2.2 The Client's named users raise support requests through the client portal, or by email to consulting@yourbusiness.today if the portal is unavailable.

2.3 YBT sets the priority of each request using the table below, taking the Client's view into account.

| Priority      | Meaning                                                                                                | Response target (within support hours) | What YBT does                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 — Critical | The Solution is down, or a core function is unusable for everyone, or a security incident is suspected | 1 support hour                         | Works on it continuously during support hours and updates the Client at least every 2 hours until it is resolved or a workaround is in place |
| P2 — High     | A core function is impaired and there is no reasonable workaround                                      | 4 support hours                        | Works on it with priority and updates the Client daily                                                                                       |
| P3 — Normal   | A minor fault, a question, or a problem with a workaround                                              | Next Business Day                      | Schedules the fix and tells the Client when to expect it                                                                                     |
| Change        | A request for something new or different                                                               | Acknowledged within 2 Business Days    | Handled within the monthly change-work allowance in the Order Form, or quoted as a change request                                            |

2.4 The response target is the time until a person at YBT has acknowledged the request and started work on it. YBT does not commit to a resolution time, because some causes lie outside its control, but it will work on P1 and P2 requests as described above.

## 3. Backup and recovery

3.1 Recovery point objective: no more than 24 hours of data lost, from automated geo-redundant backups taken at least daily and replicated to the paired Azure region.

3.2 Recovery time objective: the Solution restored within 8 support hours of a decision to restore.

3.3 Point-in-time backups are kept for 35 days, weekly long-term backups for 12 weeks and monthly long-term backups for 12 months. YBT tests a restore at least every six months and records the result.

## 4. Service credits

4.1 If availability in a month falls below 99.5%, the Client may claim a service credit against the next monthly Run service fee:

| Monthly availability | Service credit                     |
| -------------------- | ---------------------------------- |
| 99.0% to below 99.5% | 5% of that month's Run service fee |
| 98.0% to below 99.0% | 10%                                |
| 95.0% to below 98.0% | 20%                                |
| Below 95.0%          | 30%                                |

4.2 Service credits must be claimed in writing within 30 days of the end of the month concerned. They are capped at 30% of the monthly Run service fee, are not payable in cash, and are the sole and exclusive remedy for failing to meet the availability target.

## 5. Exclusions

Unavailability does not count against the target, and no credit is due, to the extent it is caused by:

- an outage of Microsoft Azure or another platform the Solution depends on, outside YBT's control;
- a third-party service or API the Client asked the Solution to use;
- the Client's own network, devices, identity provider or internet connection;
- use of the Solution in breach of the Acceptable Use Policy, or the Client's instructions;
- planned maintenance announced at least 3 Business Days in advance and carried out between 19:00 and 07:00 UK time or at weekends, up to 4 hours a month;
- emergency security patching needed to protect the Solution or the Client's data;
- a force majeure event under the Master Services Agreement;
- suspension under clause 7.4 of the Master Services Agreement for unpaid fees.

## 6. Monthly change work

6.1 The Run service includes the change-work allowance stated in the Order Form each month. Unused time does not carry forward. Work beyond the allowance is quoted as a change request under clause 5 of the Master Services Agreement.

## 7. Reporting

7.1 On request, YBT will report the month's availability, the support requests raised and their status, and any restore tests carried out.
