/** Where the upload box's page lives. Each version's own address begins with this. */
export const uploadBoxResourceHome = 'ui://your-business-today/task-upload-box';

export const showUploadBoxToolName = 'show_task_upload_box';

/** The tool the box itself calls, one step of sending a file at a time. */
export const uploadBoxStepToolName = 'perform_upload_box_step';

export type UploadBoxStepName = 'open' | 'grant' | 'record' | 'attach';

export const uploadBoxStepNames: UploadBoxStepName[] = ['open', 'grant', 'record', 'attach'];
