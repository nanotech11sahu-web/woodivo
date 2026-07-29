import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AutoReplyRule, AutoReplyRulePayload } from '@/types/auto-reply-rule';

const AUTO_REPLY_RULES_KEY = 'auto-reply-rules';

async function fetchAutoReplyRules(): Promise<AutoReplyRule[]> {
  const { data } = await apiClient.get<AutoReplyRule[]>('/admin/auto-reply-rules');
  return data;
}

async function fetchAutoReplyRule(id: string): Promise<AutoReplyRule> {
  const { data } = await apiClient.get<AutoReplyRule>(`/admin/auto-reply-rules/${id}`);
  return data;
}

async function createAutoReplyRuleRequest(payload: AutoReplyRulePayload): Promise<AutoReplyRule> {
  const { data } = await apiClient.post<AutoReplyRule>('/admin/auto-reply-rules', payload);
  return data;
}

async function updateAutoReplyRuleRequest(
  id: string,
  payload: AutoReplyRulePayload,
): Promise<AutoReplyRule> {
  const { data } = await apiClient.patch<AutoReplyRule>(`/admin/auto-reply-rules/${id}`, payload);
  return data;
}

async function deleteAutoReplyRuleRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/auto-reply-rules/${id}`);
}

export function useAutoReplyRules() {
  return useQuery({
    queryKey: [AUTO_REPLY_RULES_KEY, 'list'],
    queryFn: fetchAutoReplyRules,
  });
}

export function useAutoReplyRule(id: string | undefined) {
  return useQuery({
    queryKey: [AUTO_REPLY_RULES_KEY, 'detail', id],
    queryFn: () => fetchAutoReplyRule(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAutoReplyRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAutoReplyRuleRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [AUTO_REPLY_RULES_KEY] }),
  });
}

export function useUpdateAutoReplyRule(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AutoReplyRulePayload) => updateAutoReplyRuleRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [AUTO_REPLY_RULES_KEY] }),
  });
}

export function useDeleteAutoReplyRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAutoReplyRuleRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [AUTO_REPLY_RULES_KEY] }),
  });
}
