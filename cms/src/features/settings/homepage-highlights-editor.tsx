import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DragHandle, SortableList, useSortableRow } from '@/components/shared/sortable-list';
import { cn } from '@/lib/utils';
import { HOMEPAGE_HIGHLIGHT_ICON_OPTIONS } from '@/lib/homepage-icons';
import type { SettingsFormValues } from './settings-form-schema';

interface HomepageHighlightsEditorProps {
  control: Control<SettingsFormValues>;
  register: UseFormRegister<SettingsFormValues>;
}

/**
 * Same shape as `about/values-editor.tsx` (a `useFieldArray` list, one
 * card per row, append/remove) with one difference: an icon `<Select>`
 * per row (`HOMEPAGE_HIGHLIGHT_ICON_OPTIONS`, mirroring the backend's
 * fixed enum rather than a free-text field).
 *
 * Phase 29 gave this editor its own up/down move buttons since no drag
 * library existed in the project yet. Phase 30 added `@dnd-kit`
 * project-wide (`components/shared/sortable-list.tsx`) for exactly this
 * reorder need across five editors, so the buttons are gone in favour of
 * the same drag handle the other four now use — `move()` from
 * `useFieldArray` is still what actually reorders the array, only the
 * UI that calls it changed.
 */
export function HomepageHighlightsEditor({ control, register }: HomepageHighlightsEditorProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'homepage.whyWoodivoPoints',
  });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-ink-muted">
          No highlights added yet — the public site shows four default points until you add
          some here.
        </p>
      )}

      <SortableList
        ids={fields.map((field) => field.id)}
        onReorder={(oldIndex, newIndex) => move(oldIndex, newIndex)}
      >
        {fields.map((field, index) => (
          <HighlightRow
            key={field.id}
            id={field.id}
            index={index}
            register={register}
            onRemove={() => remove(index)}
          />
        ))}
      </SortableList>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={fields.length >= 12}
        onClick={() => append({ icon: 'tree-pine', title: '', description: '' })}
      >
        <Plus size={14} />
        Add highlight
      </Button>
      {fields.length >= 12 ? (
        <p className="text-xs text-ink-muted">Maximum of 12 highlights.</p>
      ) : null}
    </div>
  );
}

interface HighlightRowProps {
  id: string;
  index: number;
  register: UseFormRegister<SettingsFormValues>;
  onRemove: () => void;
}

function HighlightRow({ id, index, register, onRemove }: HighlightRowProps) {
  const { setNodeRef, style, dragHandleProps, isDragging } = useSortableRow(id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-2 rounded-md border border-border-warm bg-card p-3',
        isDragging && 'z-10 opacity-90 shadow-lg',
      )}
    >
      <DragHandle {...dragHandleProps} className="mt-1" />
      <div className="flex-1 space-y-2">
        <Select {...register(`homepage.whyWoodivoPoints.${index}.icon` as const)}>
          {HOMEPAGE_HIGHLIGHT_ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Title (e.g. Solid timber, not veneer)"
          {...register(`homepage.whyWoodivoPoints.${index}.title` as const)}
        />
        <Textarea
          placeholder="Description"
          rows={2}
          {...register(`homepage.whyWoodivoPoints.${index}.description` as const)}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
        aria-label="Remove highlight"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
