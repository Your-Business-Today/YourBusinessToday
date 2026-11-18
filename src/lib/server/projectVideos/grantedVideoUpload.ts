/** The links a video's film, thumbnail and captions are sent to, and the id it is kept under once the film arrives. */
export type GrantedVideoUpload = { videoId: string; filmUploadUrl: string; thumbnailUploadUrl: string | null; captionsUploadUrl: string | null };
