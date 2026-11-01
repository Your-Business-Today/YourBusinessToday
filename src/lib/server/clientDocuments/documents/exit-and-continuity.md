# Schedule 4 — Exit and Continuity

**Version 1.3 — 1 November 2026**

This schedule forms part of the Master Services Agreement between Your Business Today Ltd ("**YBT**") and [Client legal name] (the "**Client**"). It says how the Client gets its data and its system back — when the Run service ends normally, and if YBT cannot continue.

## 1. The principle

1.1 The Client's data is the Client's. YBT will never hold it back to secure payment, and its duties under this schedule continue even while access is suspended for unpaid fees.

## 2. Export at any time

2.1 **Self-service.** The Client's authorised administrator can export the Client Data from the Solution at any time, as often as the Client wishes, without asking YBT and at no charge. Every export is logged in the Solution.

2.2 **On request.** If the Solution cannot be used to export for any reason, the Client may instead ask YBT in writing for a full export, and YBT will provide it within 10 Business Days of the request, at no charge.

2.3 **After the Run service ends.** The self-service export stays available to the Client's authorised administrator for 30 days after the Run service ends.

2.4 An export contains:

- a full database backup (a SQL Server .bak or .bacpac file, or the native backup format of the database used);
- the same data as CSV files, one per table;
- the documented database schema, describing each table and field;
- all files and attachments stored by the Solution, in their original formats.

## 3. When the Run service ends

3.1 **Export.** Within 10 Business Days of the end of the Run service (or of the Client's written request, if later), YBT provides a final export as in section 2.4. This is in addition to the self-service export under section 2.3.

3.2 **Source and hand-over.** For every stage that has been paid for, YBT hands over the source code, infrastructure definitions, configuration (without secrets, which are handed over separately and securely), and the documentation needed to run the Solution elsewhere.

3.3 **Deletion.** Unless the Client asks otherwise in writing, YBT deletes the Client Data from the live Solution within 30 days after the final export is delivered, and gives the Client a written certificate of deletion. Copies in point-in-time backups expire and are destroyed automatically within 35 days after that, and YBT deletes the weekly and monthly long-term backups kept under Schedule 2 section 3.3 when it deletes the live Solution. YBT keeps nothing longer except where the law requires it.

3.4 **Transition help.** If the Client asks, YBT will help move the Solution to the Client or to a new supplier, at the day rate in the Order Form, capped at 5 days unless agreed otherwise in writing.

## 4. Taking over the Azure subscription

4.1 Each client's Solution runs in its own Microsoft Azure subscription, held by YBT under its Microsoft Customer Agreement and dedicated to that client. This is what makes the Solution transferable as a whole.

4.2 On the Client's request when the Run service ends, and in any Release Event, YBT will transfer billing ownership of that subscription to a Microsoft Customer Agreement account held by the Client or by a successor the Client nominates, or will move the Solution's resources into a subscription the Client owns.

4.3 The Client should note that a move between Microsoft tenants does not carry across role assignments, access policies or usage history. These are recreated as part of the transition, using the infrastructure definitions handed over under section 3.2.

4.4 **Before a transfer can be accepted.** The party taking over the subscription needs a Microsoft Customer Agreement billing account of its own. Reservations, savings plans and some Azure Marketplace purchases do not travel with the subscription; YBT will list any that apply to the Solution before the transfer, and the Client decides whether to replace them under its own account.

## 5. If YBT cannot continue

5.1 A **Release Event** happens if YBT (a) becomes insolvent, enters administration or liquidation, or has a receiver appointed; (b) ceases to trade; or (c) fails to respond to a P1 support request for 5 consecutive Business Days after written notice from the Client.

5.2 **Continuity copy.** So that the Client never depends on YBT's continued existence to reach its own system, YBT will, every month, write a copy of the Solution's database backup, source code and infrastructure definitions to a storage location the Client owns and controls. The Client should check that it can open these copies.

5.3 **Step-in.** On a Release Event, the Client (or the successor it nominates in the Order Form, if any) may take over the running of the Solution, and YBT (or its insolvency practitioner) will immediately do what is needed to give effect to section 4.2 and hand over the credentials needed to operate the Solution. YBT grants the Client, now, the licences needed to do this.

## 6. Survival

This schedule survives the end of the Master Services Agreement until every duty in it has been performed.
