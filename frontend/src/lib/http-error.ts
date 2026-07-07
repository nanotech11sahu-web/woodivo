import axios from 'axios';

/** True when the backend responded 404 — an unknown or unpublished slug, not a network/server failure. */
export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
