import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { BlogFaqItem } from '@/types/blog';

interface BlogFaqEditorProps {
  value: BlogFaqItem[];
  onChange: (faqs: BlogFaqItem[]) => void;
}

/** Repeatable question/answer rows for a post's FAQ block — feeds both the
 * on-page FAQ section and the `FAQPage` JSON-LD on the frontend. */
export function BlogFaqEditor({ value, onChange }: BlogFaqEditorProps) {
  function addRow() {
    onChange([...value, { question: '', answer: '' }]);
  }

  function updateRow(index: number, patch: Partial<BlogFaqItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {value.map((item, index) => (
        <div key={index} className="rounded-md border border-border-warm p-3">
          <div className="mb-2 flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Question"
                value={item.question}
                onChange={(event) => updateRow(index, { question: event.target.value })}
              />
              <Textarea
                placeholder="Answer"
                rows={2}
                value={item.answer}
                onChange={(event) => updateRow(index, { answer: event.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="mt-1 shrink-0 rounded p-1 text-ink-muted hover:bg-rust-light hover:text-rust"
              aria-label={`Remove FAQ ${index + 1}`}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        <Plus size={14} />
        Add question
      </Button>
    </div>
  );
}
