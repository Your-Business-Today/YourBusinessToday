# Parity audit: the site and the connector

Every story a person does on a screen of Your Business Today, with the connector action a Claude does it with. `read_project_mcp_map` reads this file: one row per story, its screens in the last column and its connector actions in the one before, `—` where the connector has no door yet. A row with screens and no action is a parity gap, and the gaps are the build list at the bottom.

Read on 12 November 2026 against 69 routes, 123 form actions and 281 connector actions (171 writes). The connector's audiences are the site's: `everyone` is anyone signed in, `staff` the clients register and the organisations, `admin` the admin pages.

What the audit leaves out, on purpose, is listed under *By design* at the end: signing in, passwords, the OAuth consent page, the public forms and the pages that only draw.

## 01-account-and-notifications

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-001 | see who I am signed in as and what I can reach | anyone | read | `/account` load | `get_current_context` `who_am_i` | `/account` |
| US-002 | change the name I go by | anyone | write | `saveDisplayName` | `set_display_name` | `/account` |
| US-003 | read my notifications, newest first | anyone | read | `/notifications` load | `list_notifications` | `/notifications` |
| US-004 | open one notification and have it marked read | anyone | write | `openNotification` | `mark_notification_read` | `/notifications` |
| US-005 | mark every notification read | anyone | write | `markAllRead` | `mark_all_notifications_read` | `/notifications` |
| US-006 | see everything that needs me in one answer | anyone | read | `/` and `/projects` | `list_waiting_on_me` `read_ybt_summary` | `/projects` |

## 02-projects

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-010 | see the projects of the organisation I am looking at | anyone | read | `/projects` load | `list_projects` `list_unassigned_projects` | `/projects` |
| US-011 | create a project | anyone | write | `createProject` | `create_project` | `/projects` |
| US-012 | change a project's details | anyone | write | `updateProject` | `update_project_details` | `/projects` `/projects/{projectId}` |
| US-013 | delete a project | owner | write | `deleteProject` | `delete_project` | `/projects` |
| US-014 | put my projects in my own order | anyone | write | `moveProject` `setProjectPriority` | `move_project` `place_project` `set_project_priority` | `/projects` |
| US-015 | read how a project stands and what happened on it | member | read | `/projects/{projectId}` load | `read_project` `read_project_state` `read_project_feed` | `/projects/{projectId}` |
| US-016 | invite someone to a project, take them off it, or hand it on | member | write | `invitePerson` `removeMember` `transferOwnership` | `invite_to_project` `remove_project_member` `transfer_project_ownership` `list_project_people` | `/projects/{projectId}` |
| US-017 | say which organisation and client a project belongs to | member | write | `updateProject` | `set_project_organisation` `set_project_client` `set_team_project` | `/projects/{projectId}` |
| US-018 | see which goals and tasks go autocomplete and switch one | member | write | `/projects/autocomplete` load, `setGoalAutocomplete` `setAutocomplete` | `read_autocomplete_register` `set_goal_autocomplete` `set_task_autocomplete` | `/projects/autocomplete` `/projects/{projectId}/tasks/{taskId}` |
| US-019 | see which kit version each project runs and refresh the register | anyone | read | `/projects/kit-versions` load, `readKitVersions` | `read_kit_versions` `refresh_kit_versions` | `/projects/kit-versions` |
| US-020 | read a project's deploy history | member | read | `/projects/{projectId}/deploys` load | `read_deploy_history` | `/projects/{projectId}/deploys` |
| US-021 | see what is staged and deploy it now | member | write | `deployNow` | `deploy_staging_now` | `/projects/{projectId}/staged` |
| US-022 | read a project's domain and site map | member | read | `/projects/{projectId}/domain` load | `read_project_domain` `read_project_site_map` `read_project_mcp_map` | `/projects/{projectId}/domain` `/projects/{projectId}/site-map` |
| US-023 | refresh a project's domain and site map from its repository | member | write | opening the page | `refresh_project_blueprint` `file_project_site_map` `start_site_map_run` `list_product_repository_folder` `read_product_repository_file` | `/projects/{projectId}/domain` `/projects/{projectId}/site-map` |
| US-024 | assign internal work and give it a due date | member | write | `setAssignees` `setDueDate` | `set_task_assignees` `update_task_details` | `/projects/{projectId}` |

## 03-goals

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-030 | raise a goal, with its first tasks | member | write | `createGoal` | `create_goal` `create_goal_with_tasks` | `/projects/{projectId}` |
| US-031 | read a goal and find goals by their words | member | read | `/projects/{projectId}/goals/{goalId}` load | `read_goal` `find_goals` | `/projects/{projectId}/goals/{goalId}` |
| US-032 | change a goal, its status, its priority and its order | member | write | `saveGoal` `moveGoal` `setGoalPriority` | `update_goal` `set_goal_status` `set_goal_priority` `move_goal` `place_goal` | `/projects/{projectId}/goals/{goalId}` `/projects/{projectId}` |
| US-033 | delete a goal | member | write | `deleteGoal` | `delete_goal` | `/projects/{projectId}/goals/{goalId}` |
| US-034 | post on a goal's conversation | member | write | `postMessage` | `post_message` | `/projects/{projectId}/goals/{goalId}` |
| US-035 | add someone to a goal's conversation, or take them off it | member | write | `addParticipant` `removeParticipant` | `add_conversation_participant` `remove_conversation_participant` | `/projects/{projectId}/goals/{goalId}` |

## 04-tasks

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-040 | find tasks and read one in full, with its conversation | member | read | `/projects/{projectId}/tasks/{taskId}` load | `find_tasks` `read_task` `read_task_conversation` | `/projects/{projectId}/tasks/{taskId}` |
| US-041 | raise a task, a bug or a story, and see the ones like it first | member | write | `createTask` | `create_task` `find_similar_tasks` | `/projects/{projectId}` |
| US-042 | change a task's title, details, due date, goal, kind, department and points | member | write | `saveTask` `setGoal` `setStoryPoints` | `update_task_details` `set_task_user_story` `record_complexity` | `/projects/{projectId}/tasks/{taskId}` |
| US-043 | move a task's status, priority and place on the board | member | write | `setStatus` `moveTask` `setTaskPriority` | `update_task_status` `move_task` `place_task` `set_task_priority` `set_task_queue_priority` `move_queued_task` `place_queued_task` | `/projects/{projectId}` |
| US-044 | move a task to another project | member | write | `saveTask` | `move_task_to_project` | `/projects/{projectId}/tasks/{taskId}` |
| US-045 | add a subtask and say what a task waits for | member | write | `addSubtask` | `set_task_parent` `set_task_waits_for` | `/projects/{projectId}/tasks/{taskId}` |
| US-046 | keep a checklist on a task | member | write | `addChecklist` `renameChecklist` `deleteChecklist` `addChecklistItem` `setChecklistItemDone` `deleteChecklistItem` | `add_checklist` `rename_checklist` `delete_checklist` `add_checklist_item` `set_checklist_item_done` `delete_checklist_item` | `/projects/{projectId}/tasks/{taskId}` |
| US-047 | say what must be true before a task counts as done | member | write | `addCriterion` `setCriterionMet` `deleteCriterion` | `add_acceptance_criterion` `set_acceptance_criterion_met` `delete_acceptance_criterion` | `/projects/{projectId}/tasks/{taskId}` |
| US-048 | attach a file to a task, read one, or remove one | member | write | `grantAttachment` `recordAttachment` `deleteAttachment` | `grant_task_upload` `record_task_upload` `attach_file_to_task` `read_task_attachment` `remove_task_attachment` | `/projects/{projectId}/tasks/{taskId}` |
| US-049 | record the branch and pull request a task is on | member | write | `setBranch` | `set_task_branch` `find_task_by_branch` | `/projects/{projectId}/tasks/{taskId}` |
| US-050 | say who is working on a task and what roles it needs | member | write | `setAssignees` | `set_task_assignees` `set_task_roles` | `/projects/{projectId}/tasks/{taskId}` |
| US-051 | post on a task's conversation and resolve a support task | member | write | `postMessage` `resolve` | `post_message` `resolve_support_task` | `/projects/{projectId}/tasks/{taskId}` |
| US-052 | add someone to a task's conversation, or take them off it | member | write | `addParticipant` `removeParticipant` | `add_conversation_participant` `remove_conversation_participant` | `/projects/{projectId}/tasks/{taskId}` |
| US-053 | delete a task | member | write | `deleteTask` | `delete_task` | `/projects/{projectId}/tasks/{taskId}` |
| US-054 | see the open tasks in my name and the build queue | member | read | `/projects/{projectId}` load | `read_team_tasks` `read_task_queue` `read_build_queue` | `/projects/{projectId}` |
| US-055 | raise a support task and see the open ones | member | write | `createTask` | `create_support_task` `list_open_support_tasks` | `/projects/{projectId}` |
| US-056 | confirm what I tested | anyone | write | `postMessage` | `record_test_results` | `/projects/{projectId}/tasks/{taskId}` |

## 05-conversations-and-to-dos

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-060 | read what was said to me since I last looked | anyone | read | `/notifications` load | `read_latest_messages` | `/notifications` |
| US-061 | keep my own to-do list | anyone | write | `/projects` load | `list_my_todos` `add_todo` `update_todo` `complete_todo` | `/projects` |

## 06-clients-register

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-070 | see the clients and the leads, stage by stage | staff | read | `/clients` and `/leads` load | `list_clients` | `/clients` `/leads` |
| US-071 | add a lead by name, with its first contact and who brought it in | staff | write | `addLead` | `create_client` `add_client_contact` | `/leads` |
| US-072 | move a client to another stage | staff | write | `moveStage` | `move_client_stage` | `/clients` `/leads` `/clients/{clientId}` |
| US-073 | read a client in full, with its history | staff | read | `/clients/{clientId}` load | `read_client` `read_client_history` | `/clients/{clientId}` |
| US-074 | list a contact at a client, invite them, assign a project | staff | write | `addContact` `inviteContact` `assignProject` | `add_client_contact` `invite_client_contact` `assign_project_to_client` | `/clients/{clientId}` |
| US-075 | set a new client up on Your Business Today | staff | write | `setUpClient` | `set_up_client` | `/clients/{clientId}` |
| US-076 | change a client's company profile | staff | write | `updateProfile` | `update_company_profile` | `/clients/{clientId}` |
| US-077 | record a client's continuity copy | staff | write | `recordContinuityCopy` | `record_client_continuity_copy` | `/clients/{clientId}` |
| US-078 | group a client under a parent and import its officers from Companies House | staff | write | `groupUnder` `importOfficers` | `group_client_under` `import_company_officers` | `/clients/{clientId}` |
| US-079 | delete a mistaken client record | staff | write | `deleteClient` | `delete_client` | `/clients/{clientId}` |
| US-080 | research a company and save the findings, its filings and its job adverts | staff | write | `/clients/research` | `save_company_research` `read_company_filings` `read_company_job_adverts` `save_company_job_adverts` | `/clients/{clientId}` `/clients/research` |
| US-081 | search Companies House by SIC code and place and add a company as a lead, with its directors | staff | write | `addLead` `addLeadWithDirectors` | `search_companies_house` `add_company_as_lead` | `/clients/prospect` `/clients/map` |
| US-082 | see the companies around a postcode on the map | staff | read | `/clients/map` load | `read_area_map` | `/clients/map` |
| US-083 | read the feed of what changed across the register | staff | read | `/clients/feed` load | `read_patch_feed` | `/clients/feed` |
| US-084 | read a client's workflow map, and the version they confirmed | staff | read | `/clients/{clientId}/workflow-map` load | `read_workflow_map` `read_confirmed_workflow_map` | `/clients/{clientId}/workflow-map` |
| US-085 | name who brought a lead or client in | staff | write | `setBroughtInBy` | `set_client_brought_in_by` | `/clients/{clientId}` |
| US-086 | see each person's leads and won sales on the leaderboard | staff | read | `/leaderboard` load | `read_leaderboard` | `/leaderboard` |

## 07-people-register

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-090 | see everyone on the People register, with their warmth and companies | staff | read | `/people` load | `list_people` | `/people` |
| US-091 | add a person as a lead | staff | write | `addPerson` | `add_person` | `/people` |
| US-092 | find an officer on Companies House and add them as a person | staff | write | `addOfficer` | `search_officers` `add_officer_as_person` | `/people` |
| US-093 | read a person in full, with their companies, links, notes and history | staff | read | `/people/{personId}` load | `read_person` | `/people/{personId}` |
| US-094 | change a person's details and standing | staff | write | `updatePerson` | `update_person` | `/people/{personId}` `/clients/{clientId}` |
| US-095 | keep links on a person | staff | write | `addLink` `removeLink` | `add_person_link` `remove_person_link` | `/people/{personId}` `/clients/{clientId}` |
| US-096 | add a note to a person | staff | write | `addNote` | `add_person_note` | `/people/{personId}` `/clients/{clientId}` |
| US-097 | import a person's current appointments as leads, grouped | staff | write | `importAppointments` `groupUnder` | `read_person_appointments` `import_person_appointments` | `/people/{personId}` |
| US-098 | research a person on the web and save it, or draft the approach | staff | write | `/people/{personId}` modals | `save_person_research` `save_person_approach` | `/people/{personId}` |
| US-099 | delete a person added by mistake | staff | write | `deletePerson` | `delete_person` | `/people/{personId}` |

## 08-patches-and-prospecting

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-100 | see my patches and open one | staff | read | `/clients/patches` load | `list_patches` `read_patch` `read_patch_brief` | `/clients/patches` `/clients/patches/{patchId}` |
| US-101 | draw a new patch | staff | write | `/clients/patches` | `create_patch` | `/clients/patches` |
| US-102 | read the companies registered in a patch, and one in full | staff | read | `/clients/patches/{patchId}` load | `read_patch_companies` `read_patch_company` | `/clients/patches/{patchId}` |
| US-103 | add a patch company or premises as a lead | staff | write | `addLead` `addPremisesAsLead` | `add_patch_company_as_lead` `add_premises_as_lead` `list_patch_premises` | `/clients/patches/{patchId}` |
| US-104 | work the sectors of a patch: claim, hand on, release, mark searched | staff | write | `claimSector` `handSectorTo` `releaseSector` `markSearched` | `list_patch_sectors` `read_sector` `claim_sector` `hand_sector_to` `release_sector` `mark_sector_searched` `list_unsearched_sectors` | `/clients/patches/{patchId}` `/clients/patches/{patchId}/sectors/{sector}` |
| US-105 | record a sighting, match it to the register, add it as a lead | staff | write | `recordSighting` `matchSighting` `addSightingAsLead` | `record_sighting` `match_sighting_to_register` `add_sighting_as_lead` `list_sightings` | `/clients/patches/{patchId}/sightings` |
| US-106 | record what was observed in a patch and read its feed | staff | write | `/clients/patches/{patchId}` | `record_patch_observation` `read_patch_feed` `run_patch_watch` | `/clients/patches/{patchId}` |

## 09-organisations

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-110 | see my organisations and create one | staff | write | `createOrganisation` | `list_organisations` `create_organisation` | `/organisations` |
| US-111 | read an organisation and change what we hold about it | staff | write | `updateDetails` | `read_organisation` `update_organisation_details` | `/organisations/{organisationId}` |
| US-112 | invite a person to an organisation, make them its manager, take them off it | staff | write | `invitePerson` `setManager` `removeMember` | `invite_to_organisation` `set_organisation_manager` `remove_organisation_member` | `/organisations/{organisationId}` |
| US-113 | switch a module on or off for an organisation | staff | write | `setModule` | `set_organisation_module` | `/organisations/{organisationId}` |
| US-114 | name a director of an organisation | staff | write | `setDirector` | `set_organisation_director` | `/organisations/{organisationId}` |
| US-115 | delete an organisation | staff | write | `deleteOrganisation` | `delete_organisation` | `/organisations/{organisationId}` |
| US-116 | see the open work of an organisation's team, department by department | member | read | `/organisations/{organisationId}/task-management` load | `read_team_work` | `/organisations/{organisationId}/task-management` |
| US-117 | read and set an organisation's domain | manager | write | `/organisations/{organisationId}/domain` load | `read_business_brain_domain` `file_business_brain_domain` `start_business_brain_domain_run` | `/organisations/{organisationId}/domain` |
| US-118 | file an organisation's workflow map, Before or After, and read it back | member | write | — | `file_workflow_map` `read_workflow_map` | — |
| US-119 | say "map the workflows" and be walked through finding the roles, their tasks and the hand-overs | member | read | — | `start_workflow_map_run` | — |

## 10-boardroom

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-120 | see the boardroom and its meetings | director | read | `/organisations/{organisationId}/boardroom` load | `read_boardroom` `list_board_meetings` | `/organisations/{organisationId}/boardroom` |
| US-121 | call a meeting with its agenda, and change the agenda | director | write | `callMeeting` | `call_board_meeting` `change_board_agenda` | `/organisations/{organisationId}/boardroom` |
| US-122 | open the room, read an item, brief it and speak on it | director | write | `briefItem` | `open_board_room` `read_board_meeting` `read_board_item` `brief_board_item` `speak_on_board_item` | `/organisations/{organisationId}/boardroom/{meetingId}` |
| US-123 | put a paper before the board and read one | director | write | `/organisations/{organisationId}/boardroom/{meetingId}` | `add_board_paper` `add_board_paper_from_records` `record_board_paper_upload` `read_board_paper` `read_board_brief` | `/organisations/{organisationId}/boardroom/{meetingId}` |
| US-124 | steer my own Claude in the room and change its seat settings | director | write | `steerClaude` `changeSetting` | `steer_own_claude` `change_own_claude_setting` | `/organisations/{organisationId}/boardroom/{meetingId}` |
| US-125 | answer a contribution my Claude held back | director | write | `answerHeld` | `answer_held_contribution` | `/organisations/{organisationId}/boardroom/{meetingId}` |
| US-126 | answer a decision and set a decision rule | director | write | `answerDecision` | `answer_board_decision` `record_board_decision_rule` | `/organisations/{organisationId}/boardroom/{meetingId}` |
| US-127 | close the meeting, write and answer the minutes, record the actions | director | write | `closeMeeting` `answerMinutes` `recordAction` `raiseActions` | `close_board_meeting` `write_board_minutes` `read_board_minutes` `answer_board_minutes` `record_board_action` `raise_board_actions` | `/organisations/{organisationId}/boardroom/{meetingId}` |

## 11-brand

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-130 | read the brand kit and describe, define, decide and resolve the brand | manager | write | `/organisations/{organisationId}/brand` load | `read_brand` `read_brand_sheet` `read_brand_catalogue` `describe_brand` `define_brand_trait` `record_brand_decisions` `adopt_brand_decision` `retire_brand_decision` `resolve_brand` | `/organisations/{organisationId}/brand` |
| US-131 | read the month's content plan and approve it | manager | write | `/organisations/{organisationId}/brand/plan` load | `read_content_plan` `plan_content_idea` `approve_content_month` | `/organisations/{organisationId}/brand/plan` |
| US-132 | draft, review, approve, schedule and publish a piece of content | manager | write | `/organisations/{organisationId}/brand/content/{contentPieceId}` load | `list_content` `read_content` `draft_content` `review_content` `send_content_for_approval` `schedule_content` `move_content_to_day` `record_publication` `add_content_channel` | `/organisations/{organisationId}/brand/content/{contentPieceId}` |
| US-133 | choose or ask for a post's picture | manager | write | `/organisations/{organisationId}/brand/content/{contentPieceId}` | `choose_post_picture` `say_post_picture_needed` `list_posts_awaiting_picture` | `/organisations/{organisationId}/brand/content/{contentPieceId}` |
| US-134 | plan a campaign, add content to it and read its report | manager | write | `/organisations/{organisationId}/brand/campaigns/{campaignId}` load | `list_campaigns` `plan_campaign` `add_content_to_campaign` `set_campaign_status` `record_campaign_audience` `read_campaign_report` | `/organisations/{organisationId}/brand/campaigns/{campaignId}` |
| US-135 | record and read how content performed | manager | write | `/organisations/{organisationId}/brand` | `record_performance` `read_performance` | `/organisations/{organisationId}/brand` |
| US-136 | read the brand library | manager | read | `/organisations/{organisationId}/brand/library` load | `list_brand_library` `read_brand_library_item` | `/organisations/{organisationId}/brand/library` |

## 12-books

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-140 | read the books overview and the statements | manager | read | `/organisations/{organisationId}/books` load | `read_books_overview` `read_trial_balance` `read_balance_sheet` `read_profit_and_loss` | `/organisations/{organisationId}/books` |
| US-141 | read the chart of accounts and one account's balance | manager | read | `/organisations/{organisationId}/books/accounts/{accountCode}` load | `read_chart_of_accounts` `explain_account_balance` `create_ledger_account` `set_ledger_account_archived` | `/organisations/{organisationId}/books/accounts/{accountCode}` |
| US-142 | raise, issue, pay, void and delete invoices | manager | write | `/organisations/{organisationId}/books` | `list_invoices` `create_invoice` `update_draft_invoice` `issue_invoice` `read_invoice` `record_invoice_payment` `void_invoice` `delete_invoice` | `/organisations/{organisationId}/books` |
| US-143 | record, pay and delete costs | manager | write | `/organisations/{organisationId}/books` | `list_expenses` `record_expense` `pay_expense` `delete_expense` | `/organisations/{organisationId}/books` |
| US-144 | keep customers and cost centres | manager | write | `/organisations/{organisationId}/books` | `create_customer` `update_customer` `list_customer_balances` `create_cost_centre` `set_cost_centre_archived` `list_cost_centres` | `/organisations/{organisationId}/books` |
| US-145 | post journals, accruals and prepayment releases | manager | write | `/organisations/{organisationId}/books` | `post_journal` `create_accrual` `create_prepayment_release` | `/organisations/{organisationId}/books` |
| US-146 | read and change the books settings, and read the record of deletes | manager | write | `/organisations/{organisationId}/books` | `read_books_settings` `change_books_settings` `list_books_deletions` `read_books_deletion` | `/organisations/{organisationId}/books` |

## 13-business-brain

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-150 | read the brain's index, search it and read a page | member | read | `/organisations/{organisationId}/business-brain` load | `read_business_brain_index` `search_business_brain` `read_business_brain_page` `search_my_brains` | `/organisations/{organisationId}/business-brain` `/organisations/{organisationId}/business-brain/pages/{pageId}` |
| US-151 | file pages into the brain and revise one | member | write | `/organisations/{organisationId}/business-brain` | `file_business_brain_page` `file_business_brain_pages` `file_business_brain_page_revision` | `/organisations/{organisationId}/business-brain/pages/{pageId}` |
| US-152 | put a file into the brain and open one | member | write | `/organisations/{organisationId}/business-brain` | `grant_business_brain_file_upload` `record_business_brain_file_upload` `open_business_brain_file` | `/organisations/{organisationId}/business-brain` |
| US-153 | make a chatbot, change it, and read the questions asked through it | manager | write | `/organisations/{organisationId}/business-brain/chatbots/{chatbotId}/questions` load | `make_business_brain_chatbot` `change_business_brain_chatbot` `list_business_brain_chatbots` `list_business_brain_chatbot_questions` | `/organisations/{organisationId}/business-brain/chatbots/{chatbotId}/questions` |
| US-154 | ask through a chatbot I may use and put my answer on record | anyone | write | the person's own Claude | `list_my_chatbots` `read_chatbot_index` `search_chatbot` `read_chatbot_page` `record_chatbot_answer` | `/organisations/{organisationId}/business-brain` |

## 14-client-portal

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-160 | see my company's projects and raise a request on one | client contact | write | `/portal/projects/{projectId}` load | `list_portal_projects` `raise_portal_request` | `/portal` `/portal/projects/{projectId}` |
| US-161 | read where my requests stand and reply on one | client contact | write | `/portal/projects/{projectId}` load | `list_portal_requests` `reply_to_portal_request` | `/portal/projects/{projectId}` |
| US-163 | confirm my company's workflow map | client contact | write | `confirmMap` | `confirm_workflow_map` | `/portal/workflow-map` |
| US-179 | see my company's workflow map and mark each station right or not right | client contact | write | `markStation` | `read_my_workflow_map` `mark_workflow_map_station` | `/portal/workflow-map` |
| US-164 | see who at my company can sign in, invite someone, take them off, make them administrator | client contact | write | `invitePerson` `removePerson` `setAdministrator` | `list_portal_people` `invite_portal_person` `remove_portal_person` `set_portal_administrator` | `/portal/people` |
| US-165 | see my company's invoices and pay one | client contact | write | `pay` | `list_my_invoices` `pay_invoice` | `/portal/billing` |

## 15-admin

| Id | Story | Who | Kind | Site door | Connector | Screens |
| --- | --- | --- | --- | --- | --- | --- |
| US-170 | see every account, with its standing | admin | read | `/admin` load | `list_accounts` | `/admin` |
| US-171 | make an account staff or not | admin | write | `setStaff` | `set_staff_access` | `/admin` |
| US-172 | restrict an account, or lift the restriction | admin | write | `setRestriction` | `set_account_restriction` | `/admin` |
| US-173 | send someone a password reset | admin | write | `sendPasswordReset` | `send_password_reset` | `/admin` |
| US-174 | delete an account | admin | write | `deleteUser` | `delete_account` | `/admin` |
| US-175 | read and set the build models and the review model | admin | write | `saveBuildModel` `removeBuildModel` `setReviewModel` | `read_model_settings` `save_build_model` `remove_build_model` `set_review_model` | `/admin` |
| US-176 | see the Stripe payments to check and mark one dealt with | admin | write | `dealtWith` | `read_stripe_payments_to_check` `mark_stripe_payment_dealt_with` | `/admin/stripe-payments` |
| US-177 | read the client documents and download one | admin | read | `/admin/documents/{slug}` load | `list_client_documents` `read_client_document` (the Word pack stays a page download) | `/admin/documents` `/admin/documents/{slug}` |
| US-178 | read a server error by its reference and the data inventory | admin | read | the error page | `read_server_error` `read_data_inventory` | `/admin` |

## Connector only, by design

These have no screen because the person's Claude is the only one who needs them: `next_turn` and `answer_turn` (the YBT agent), `read_ybt_summary`, `who_am_i`, `record_lifecycle_step`, `read_lifecycle`, `read_recent_lifecycle`, `next_buildable_task`, `submit_local_build`, `set_task_buildable`, `link_person`, `unlink_person`, `geocode_register_postcodes`, `grant_task_upload` and `record_task_upload`, `save_company_research`, `save_person_research` and `save_person_approach` (the site asks the person's Claude to do these), and `search_my_brains`.

## By design, not for the connector

- Signing in (Google or password), creating an account, setting one's own password and asking for one's own reset: `/account/sign-in`, `/account/set-password`. A Claude never holds a password.
- The OAuth consent page (`/oauth/authorize`), signing out, and the connector's own routes.
- The public site and its forms: the contact form, the demo, the tax calculator's email, the case studies, the offer and vision pages.
- The upload page a task's upload box opens (`/upload/{token}`): the box is how a file only the person holds reaches the task.
- The portal's Connect your Claude page: it tells a person how to add the connector.
- The sales page of an organisation: a table of links to the registers.
- The research and job-advert panels that say *ask your Claude*: the connector actions in US-080 and US-098 are the parity.
- Downloads that only hand a file back (board papers, brain files, task attachments, the questions download): the connector reads the same records as text.

## The gaps, as the build list

None. Every story the site serves has its connector door above, and the rest is listed under *By design, not for the connector*. A story added to the site is added here with its door, or with `—` and a row in this list until the door is built.
