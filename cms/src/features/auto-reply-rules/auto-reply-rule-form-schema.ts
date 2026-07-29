import { z } from 'zod';

export const autoReplyRuleFormSchema = z
  .object({
    platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'BOTH']),
    trigger: z.enum(['COMMENT', 'DM']),
    // Comma-separated free text in the UI; split into string[] on submit.
    keywords: z.string().min(1, 'At least one keyword is required'),
    active: z.boolean(),
    priority: z.coerce.number().int().min(0),
    replyComment: z.string().max(2000).optional().or(z.literal('')),
    replyDm: z.string().max(2000).optional().or(z.literal('')),
  })
  .refine((values) => values.trigger !== 'COMMENT' || values.replyComment || values.replyDm, {
    message: 'A comment rule needs a public reply, a DM, or both',
    path: ['replyComment'],
  })
  .refine((values) => values.trigger !== 'DM' || values.replyDm, {
    message: 'A DM rule needs a reply message',
    path: ['replyDm'],
  });

export type AutoReplyRuleFormValues = z.infer<typeof autoReplyRuleFormSchema>;

export const AUTO_REPLY_RULE_FORM_DEFAULTS: AutoReplyRuleFormValues = {
  platform: 'BOTH',
  trigger: 'COMMENT',
  keywords: '',
  active: true,
  priority: 0,
  replyComment: '',
  replyDm: '',
};

export function parseKeywords(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    ),
  );
}
