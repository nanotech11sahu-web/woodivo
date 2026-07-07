import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Project, ProjectListParams, ProjectPayload } from '@/types/project';

const PROJECTS_KEY = 'projects';

async function fetchProjects(params: ProjectListParams): Promise<PaginatedResult<Project>> {
  const { data } = await apiClient.get<PaginatedResult<Project>>('/admin/projects', { params });
  return data;
}

async function fetchProject(id: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/admin/projects/${id}`);
  return data;
}

async function createProjectRequest(payload: ProjectPayload): Promise<Project> {
  const { data } = await apiClient.post<Project>('/admin/projects', payload);
  return data;
}

async function updateProjectRequest(id: string, payload: ProjectPayload): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/admin/projects/${id}`, payload);
  return data;
}

async function deleteProjectRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/projects/${id}`);
}

async function reorderProjectsRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/projects/reorder', { items });
}

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: [PROJECTS_KEY, 'list', params],
    queryFn: () => fetchProjects(params),
    placeholderData: keepPreviousData,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: [PROJECTS_KEY, 'detail', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => updateProjectRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProjectRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderProjectsRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}
