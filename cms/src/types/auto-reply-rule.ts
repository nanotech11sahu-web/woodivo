export type AutoReplyPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'BOTH';
export type AutoReplyTrigger = 'COMMENT' | 'DM';

export interface AutoReplyRule {
  id: string;
  platform: AutoReplyPlatform;
  trigger: AutoReplyTrigger;
  keywords: string[];
  active: boolean;
  priority: number;
  replyComment?: string;
  replyDm?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoReplyRulePayload {
  platform?: AutoReplyPlatform;
  trigger: AutoReplyTrigger;
  keywords: string[];
  active?: boolean;
  priority?: number;
  replyComment?: string;
  replyDm?: string;
}
