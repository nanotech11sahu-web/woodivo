import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import {
  useAutoReplyRule,
  useCreateAutoReplyRule,
  useUpdateAutoReplyRule,
} from './auto-reply-rules-api';
import {
  autoReplyRuleFormSchema,
  AUTO_REPLY_RULE_FORM_DEFAULTS,
  parseKeywords,
  type AutoReplyRuleFormValues,
} from './auto-reply-rule-form-schema';

export function AutoReplyRuleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: rule, isLoading: isLoadingRule } = useAutoReplyRule(id);
  const createRule = useCreateAutoReplyRule();
  const updateRule = useUpdateAutoReplyRule(id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AutoReplyRuleFormValues>({
    resolver: zodResolver(autoReplyRuleFormSchema),
    defaultValues: AUTO_REPLY_RULE_FORM_DEFAULTS,
  });

  const trigger = watch('trigger');

  useEffect(() => {
    if (!rule) return;
    reset({
      platform: rule.platform,
      trigger: rule.trigger,
      keywords: rule.keywords.join(', '),
      active: rule.active,
      priority: rule.priority,
      replyComment: rule.replyComment ?? '',
      replyDm: rule.replyDm ?? '',
    });
  }, [rule, reset]);

  async function onSubmit(values: AutoReplyRuleFormValues) {
    const payload = {
      platform: values.platform,
      trigger: values.trigger,
      keywords: parseKeywords(values.keywords),
      active: values.active,
      priority: values.priority,
      replyComment: values.replyComment || undefined,
      replyDm: values.replyDm || undefined,
    };

    try {
      if (isEditMode) {
        await updateRule.mutateAsync(payload);
        toast.success('Rule updated');
      } else {
        await createRule.mutateAsync(payload);
        toast.success('Rule created');
      }
      navigate('/auto-reply-rules');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn't update rule" : "Couldn't create rule",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingRule) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/auto-reply-rules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to auto-reply rules
      </Link>

      <PageHeader
        title={isEditMode ? 'Edit Auto-Reply Rule' : 'New Auto-Reply Rule'}
        description="Keyword-triggered engagement automation for Facebook/Instagram comments and DMs."
      />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select id="platform" className="mt-1.5" {...register('platform')}>
                  <option value="BOTH">Both</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="trigger">Fires on</Label>
                <Select id="trigger" className="mt-1.5" {...register('trigger')}>
                  <option value="COMMENT">Comment</option>
                  <option value="DM">Direct message</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  className="mt-1.5"
                  {...register('priority')}
                />
                <p className="mt-1 text-xs text-ink-muted">Lower number checked first.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                className="mt-1.5"
                placeholder="e.g. price, available, delivery"
                {...register('keywords')}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Comma-separated. Fires when the comment/message text contains any of these
                (case-insensitive).
              </p>
              {errors.keywords && (
                <p className="mt-1 text-xs text-rust">{errors.keywords.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-warm accent-walnut"
                {...register('active')}
              />
              <span className="font-medium text-espresso">Active</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trigger === 'COMMENT' && (
              <div>
                <Label htmlFor="replyComment">Public reply (posted as a comment)</Label>
                <Textarea
                  id="replyComment"
                  rows={3}
                  className="mt-1.5"
                  placeholder="Thanks for your interest! We'll DM you the details."
                  {...register('replyComment')}
                />
              </div>
            )}
            <div>
              <Label htmlFor="replyDm">
                {trigger === 'COMMENT' ? 'Also send a DM' : 'DM reply'}
              </Label>
              <Textarea
                id="replyDm"
                rows={3}
                className="mt-1.5"
                placeholder="Here's the price list you asked about: ..."
                {...register('replyDm')}
              />
              {errors.replyDm && (
                <p className="mt-1 text-xs text-rust">{errors.replyDm.message}</p>
              )}
              {errors.replyComment && (
                <p className="mt-1 text-xs text-rust">{errors.replyComment.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/auto-reply-rules" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create rule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
