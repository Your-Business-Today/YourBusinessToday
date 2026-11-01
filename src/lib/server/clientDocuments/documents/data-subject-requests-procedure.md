# Data Subject Requests and Erasure Procedure

**Internal — Your Business Today Ltd — Version 1.1 — 1 November 2026**

How YBT helps a client when someone asks to see, correct, move or delete their personal data held in a Solution YBT runs.

## 1. Who answers the person

The client is the controller, so the client answers the person — YBT does not. YBT's job is to help the client find and act on the data quickly and completely.

If a request arrives at YBT directly (by email, through the portal, or otherwise):

1. Do not respond to the person about the substance, and do not confirm or deny that YBT holds their data.
2. Forward it to the client's named contact within 2 Business Days, saying when it arrived.
3. Log it (section 5).
4. If the person asks, tell them only that YBT has passed their request to the organisation responsible for their data.

## 2. When the client passes on a request

Clients have one month from receipt to respond to the person, so YBT aims to complete its part within **5 Business Days** of the client's instruction.

The client's instruction should say who the person is (enough to find them), what they are asking for (access, correction, erasure, restriction or portability), and anything the client has decided about exemptions.

## 3. Finding one person's data

Search every place the Solution keeps personal data:

| Where                        | How to search                                                              | Notes                                                                           |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Live database                | Query by name, email and any identifiers the client gives                  | Include records where the person is mentioned, not just their own account       |
| Stored files and attachments | Search file metadata and linked records                                    |                                                                                 |
| Application and access logs  | Search by user id and email                                                | Logs roll off after 30 to 90 days, depending on the Solution                    |
| Exports held by YBT          | Check the export folder for that client                                    | Delete old exports once delivered                                               |
| Email sent by the Solution   | Check the email provider's log                                             | Metadata only                                                                   |
| AI requests                  | Check whether the Solution stores AI requests or responses for that client | The AI provider does not keep API data for training; retention is per its terms |
| Backups                      | Cannot be edited — see section 4                                           | Point-in-time backups expire after 35 days, long-term ones after 12 months      |

## 4. Erasure

1. Delete the person's records from the live database and file storage, or anonymise them where the client needs to keep the record of the transaction (for example, accounting records).
2. Delete from logs and exports where practicable.
3. **Backups cannot be edited.** Put the data beyond use: add the person's identifier to that client's **suppression list**, so that if a backup is ever restored, the suppressed records are deleted again straight after the restore, before the Solution goes back into use. The data then disappears from backups as they expire: within 35 days from point-in-time backups, and within 12 months from long-term ones.
4. Confirm to the client in writing what was deleted, what was anonymised, what remains in backups and when it will expire.

## 5. Request log

| Ref   | Received (date) | Client | From client or direct? | Type of request | Instruction received | Completed | Confirmed to client |
| ----- | --------------- | ------ | ---------------------- | --------------- | -------------------- | --------- | ------------------- |
| R-001 |                 |        |                        |                 |                      |           |                     |

## 6. Suppression lists

Each client's suppression list is kept alongside that client's Solution, not with its backups, and contains only the minimum identifier needed to find the record again (for example, a record id). It is checked after every restore and during each six-monthly restore test.
