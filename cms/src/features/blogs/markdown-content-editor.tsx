import { useRef, useState, type ChangeEvent } from 'react';
import { Bold, Image as ImageIcon, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MarkdownContentEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
}

/**
 * `content` is authored as Markdown now (Phase 37), not plain text. Rather
 * than pull in a full block/rich-text editor, this keeps the existing
 * `<Textarea>` and adds a thin toolbar that wraps the current selection —
 * zero new CMS dependencies beyond the renderer used for the preview pane,
 * which is the same `react-markdown` + `remark-gfm` + `rehype-sanitize`
 * stack the public frontend uses to render the finished post.
 */
export function MarkdownContentEditor({
  id,
  value,
  onChange,
  onBlur,
  rows = 14,
}: MarkdownContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  function wrapSelection(before: string, after: string = before) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart + before.length, selectionEnd + before.length);
    });
  }

  function insertAtCursor(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const next = value.slice(0, selectionStart) + snippet + value.slice(selectionEnd);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function handleBoldClick() {
    wrapSelection('**');
  }

  function handleBulletClick() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const bulleted = (selected || 'List item').split('\n').map((line) => `- ${line}`).join('\n');
    const next = value.slice(0, selectionStart) + bulleted + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionStart + bulleted.length);
    });
  }

  function handleImageClick() {
    insertAtCursor('![describe this image](image-url)');
  }

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={handleBoldClick}
          className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
          aria-label="Bold"
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={handleBulletClick}
          className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
          aria-label="Bullet list"
          title="Bullet list"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
          aria-label="Insert image"
          title="Insert image — paste a URL from the gallery below, or use its Copy Markdown button"
        >
          <ImageIcon size={15} />
        </button>
        <div className="ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview((prev) => !prev)}>
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div
          className={cn(
            'min-h-24 w-full overflow-y-auto rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-espresso',
          )}
          style={{ height: rows * 24 }}
        >
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-ink-muted">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <Textarea
          id={id}
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={handleTextareaChange}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}
