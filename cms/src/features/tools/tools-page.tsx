import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ImagePlus, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import {
  downloadBlob,
  downloadImageGenerationZip,
  useImageGenerationStatus,
  usePendingDraftZips,
  useRemoveDraftZip,
  useRunDraftBlogUploader,
  useStartImageGeneration,
  useUploadDraftZip,
  type DraftZipResult,
} from './tools-api';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ToolsPage() {
  const promptsInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [runResults, setRunResults] = useState<DraftZipResult[] | null>(null);
  const [genJobId, setGenJobId] = useState<string | null>(null);
  const handledJobRef = useRef<string | null>(null);

  const startGeneration = useStartImageGeneration();
  const genJobStatus = useImageGenerationStatus(genJobId);
  const pendingZips = usePendingDraftZips();
  const uploadZip = useUploadDraftZip();
  const removeZip = useRemoveDraftZip();
  const runUploader = useRunDraftBlogUploader();

  // Job finished (or failed) — download the zip once, then reset so the card goes back to idle.
  useEffect(() => {
    const status = genJobStatus.data;
    if (!genJobId || !status || handledJobRef.current === genJobId) return;
    if (status.status === 'running') return;

    handledJobRef.current = genJobId;

    if (status.status === 'failed') {
      toast.error("Couldn't generate images", status.error);
      setGenJobId(null);
      return;
    }

    downloadImageGenerationZip(genJobId)
      .then((blob) => {
        downloadBlob(blob, 'blog-images.zip');
        if (status.failures.length > 0) {
          toast.error(
            `${status.failures.length} of ${status.total} image(s) failed`,
            'The rest downloaded — see _failed.txt inside the zip.',
          );
        } else {
          toast.success('Images generated', 'Download started — grouped by tag (Blog 1, Blog 2, …).');
        }
      })
      .catch((error) => toast.error("Couldn't download the zip", getErrorMessage(error)))
      .finally(() => setGenJobId(null));
  }, [genJobId, genJobStatus.data]);

  async function handleGenerateImages() {
    const file = promptsInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Choose a prompts file first');
      return;
    }
    try {
      const { jobId } = await startGeneration.mutateAsync(file);
      handledJobRef.current = null;
      setGenJobId(jobId);
      if (promptsInputRef.current) promptsInputRef.current.value = '';
    } catch (error) {
      toast.error("Couldn't start image generation", getErrorMessage(error));
    }
  }

  async function handleUploadZip() {
    const file = zipInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Choose a draft blog zip first');
      return;
    }
    try {
      await uploadZip.mutateAsync(file);
      toast.success('Added to draft queue', file.name);
      if (zipInputRef.current) zipInputRef.current.value = '';
    } catch (error) {
      toast.error("Couldn't upload zip", getErrorMessage(error));
    }
  }

  async function handleRemoveZip(filename: string) {
    try {
      await removeZip.mutateAsync(filename);
    } catch (error) {
      toast.error("Couldn't remove zip", getErrorMessage(error));
    }
  }

  async function handleRunUploader() {
    try {
      const results = await runUploader.mutateAsync();
      setRunResults(results);
      const failedCount = results.filter((r) => r.status === 'failed').length;
      if (failedCount > 0) {
        toast.error(`${failedCount} zip(s) failed`, 'Check the results below.');
      } else {
        toast.success('Draft blogs uploaded', 'Review them in the Blogs list before publishing.');
      }
    } catch (error) {
      toast.error("Couldn't run the uploader", getErrorMessage(error));
    }
  }

  const zips = pendingZips.data ?? [];

  return (
    <div>
      <PageHeader
        title="Blog Tools"
        description="Generate blog images from a prompts file, then upload the Blog Factory draft zip and push it into the CMS as drafts."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus size={18} /> Blog Image Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-ink-muted">
              Upload a prompts <code>.md</code> file (<code>[Blog 1] hero.jpg</code> followed by the prompt
              text). Images come back as one zip, grouped into a folder per tag.
            </p>
            <input
              ref={promptsInputRef}
              type="file"
              accept=".md,.txt"
              className="mb-4 block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-sand-dark file:px-3 file:py-2 file:text-sm file:font-medium file:text-espresso"
            />
            <Button
              onClick={() => void handleGenerateImages()}
              disabled={startGeneration.isPending || (genJobId !== null && genJobStatus.data?.status === 'running')}
            >
              {(startGeneration.isPending || (genJobId !== null && genJobStatus.data?.status === 'running')) && (
                <Spinner className="text-current" />
              )}
              Generate Images
            </Button>

            {genJobId && genJobStatus.data && genJobStatus.data.status === 'running' && (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                  <span>
                    Generating {genJobStatus.data.completed} / {genJobStatus.data.total}
                  </span>
                  <span>{Math.round((genJobStatus.data.completed / genJobStatus.data.total) * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-sand-dark">
                  <div
                    className="h-full rounded-full bg-walnut transition-all duration-300"
                    style={{
                      width: `${(genJobStatus.data.completed / genJobStatus.data.total) * 100}%`,
                    }}
                  />
                </div>
                {genJobStatus.data.failures.length > 0 && (
                  <p className="mt-1 text-xs text-rust">{genJobStatus.data.failures.length} failed so far</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud size={18} /> Draft Blog Uploader
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-ink-muted">
              Upload the Blog Factory zip to queue it, then run the uploader to create every post as a{' '}
              <span className="font-medium text-espresso">draft</span> in the Blogs list.
            </p>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                className="block flex-1 text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-sand-dark file:px-3 file:py-2 file:text-sm file:font-medium file:text-espresso"
              />
              <Button variant="secondary" onClick={() => void handleUploadZip()} disabled={uploadZip.isPending}>
                {uploadZip.isPending && <Spinner className="text-current" />}
                Add to Queue
              </Button>
            </div>

            <div className="mb-4 rounded-card border border-border-warm bg-sand p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                Pending ({zips.length})
              </p>
              {pendingZips.isLoading && <Spinner />}
              {!pendingZips.isLoading && zips.length === 0 && (
                <p className="text-sm text-ink-muted">Nothing queued.</p>
              )}
              <ul className="space-y-1">
                {zips.map((zip) => (
                  <li key={zip.filename} className="flex items-center justify-between text-sm">
                    <span className="truncate text-espresso">
                      {zip.filename} <span className="text-ink-muted">· {formatBytes(zip.sizeBytes)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleRemoveZip(zip.filename)}
                      aria-label={`Remove ${zip.filename}`}
                      className="text-ink-muted hover:text-rust"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => void handleRunUploader()} disabled={runUploader.isPending || zips.length === 0}>
              {runUploader.isPending && <Spinner className="text-current" />}
              Run Uploader
            </Button>

            {runResults && (
              <div className="mt-4 space-y-3">
                {runResults.map((result) => (
                  <div key={result.zipName} className="rounded-card border border-border-warm p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-espresso">
                      {result.status === 'success' ? (
                        <CheckCircle2 size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-rust" />
                      )}
                      {result.zipName}
                    </div>
                    {result.status === 'success' && result.posts && (
                      <ul className="mt-2 space-y-1 pl-6 text-sm">
                        {result.posts.map((post) => (
                          <li key={post.id}>
                            <Link to={`/blogs/${post.id}/edit`} className="text-walnut hover:underline">
                              {post.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {result.status === 'failed' && (
                      <p className="mt-1 pl-6 text-sm text-rust">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
