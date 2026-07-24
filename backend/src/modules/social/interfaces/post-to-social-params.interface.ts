// Generic content shape SocialService needs to build a post - deliberately
// has no knowledge of Product/Blog schemas. Products and Blogs admin
// controllers each map their own document into this shape.
export interface PostToSocialParams {
  title: string;
  description: string;
  keywords: string[];
  tone?: string;
  cta?: string;
  website?: string;
  phone?: string;
  platforms: string[];
  language?: string;
  additionalInstructions?: string;
  // One or more image URLs - a single item is an ordinary post, more than
  // one is published as a Facebook/Instagram carousel by the Publisher.
  mediaUrls: string[];
  // Passed through to the Publisher so its own status listing (which
  // Woodivo's CMS reads directly, see SocialAdminController) can show what
  // Woodivo content each post came from, without the Publisher needing to
  // know anything about Product/Blog schemas. CUSTOM is a CMS-authored post
  // with no Product/Blog behind it (see CustomPostsAdminController).
  sourceType: 'PRODUCT' | 'BLOG' | 'CUSTOM';
  sourceId: string;
  // "Post Now" - skip the wait for the next scheduled slot (see
  // SocialService.triggerNow, called right after submission when set).
  urgent?: boolean;
  // "Post as Reel" - Custom Posts only; the Publisher rejects this unless
  // mediaUrls is exactly one video.
  isReel?: boolean;
}

export interface PostToSocialResult {
  reference: string;
  jobId: string;
  status: string;
}

export interface BulkSocialResultItem {
  id: string;
  success: boolean;
  reference?: string;
  error?: string;
}
