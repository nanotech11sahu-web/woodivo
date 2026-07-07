import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const PENDING_DRAFTS_KEY = 'draft-blog-zips';

export interface PendingDraftZip {
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface DraftBlogPostResult {
  title: string;
  slug: string;
  id: string;
}

export interface DraftZipResult {
  zipName: string;
  status: 'success' | 'failed';
  posts?: DraftBlogPostResult[];
  error?: string;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ---------- Blog image generator ----------

export type ImageGenJobStatusValue = 'running' | 'done' | 'failed';

export interface ImageGenJobStarted {
  jobId: string;
  total: number;
}

export interface ImageGenJobStatus {
  status: ImageGenJobStatusValue;
  total: number;
  completed: number;
  failures: string[];
  error?: string;
}

/** Kicks off generation and returns a jobId immediately — the batch itself can take minutes. */
export function useStartImageGeneration() {
  return useMutation({
    mutationFn: async (promptsFile: File) => {
      const form = new FormData();
      form.append('file', promptsFile);
      const { data } = await apiClient.post<ImageGenJobStarted>('/admin/tools/image-prompts/generate', form);
      return data;
    },
  });
}

/** Polls job progress every second while running, stops as soon as it's done or failed. */
export function useImageGenerationStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['image-gen-job', jobId],
    queryFn: async () => {
      const { data } = await apiClient.get<ImageGenJobStatus>(
        `/admin/tools/image-prompts/generate/${jobId}/status`,
      );
      return data;
    },
    enabled: jobId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 1000 : false),
  });
}

export async function downloadImageGenerationZip(jobId: string): Promise<Blob> {
  const response = await apiClient.get(`/admin/tools/image-prompts/generate/${jobId}/download`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}

export { downloadBlob };

// ---------- Draft blog uploader ----------

async function fetchPendingDraftZips(): Promise<PendingDraftZip[]> {
  const { data } = await apiClient.get<PendingDraftZip[]>('/admin/tools/draft-blogs');
  return data;
}

export function usePendingDraftZips() {
  return useQuery({
    queryKey: [PENDING_DRAFTS_KEY],
    queryFn: fetchPendingDraftZips,
  });
}

export function useUploadDraftZip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zipFile: File) => {
      const form = new FormData();
      form.append('file', zipFile);
      const { data } = await apiClient.post<PendingDraftZip>('/admin/tools/draft-blogs/upload', form);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PENDING_DRAFTS_KEY] }),
  });
}

export function useRemoveDraftZip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filename: string) => {
      await apiClient.delete(`/admin/tools/draft-blogs/${encodeURIComponent(filename)}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PENDING_DRAFTS_KEY] }),
  });
}

export function useRunDraftBlogUploader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<DraftZipResult[]>('/admin/tools/draft-blogs/run');
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PENDING_DRAFTS_KEY] }),
  });
}
