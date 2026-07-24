export interface PostToSocialOptions {
  platforms?: string[];
  tone?: string;
  cta?: string;
  additionalInstructions?: string;
  /** Skip the wait for the next scheduled slot and publish as soon as possible. */
  postNow?: boolean;
}

export interface PostToSocialResultItem {
  id: string;
  success: boolean;
  reference?: string;
  error?: string;
}

export interface PostToSocialResponse {
  results: PostToSocialResultItem[];
}
