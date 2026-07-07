import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TagsEditorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagsEditor({ value, onChange }: TagsEditorProps) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const tag = draft.trim();
    setDraft('');
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitDraft();
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-sand-dark px-3 py-1 text-xs text-espresso"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        placeholder="Type a tag and press Enter…"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
    </div>
  );
}
