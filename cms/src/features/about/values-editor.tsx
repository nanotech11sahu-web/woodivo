import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DragHandle, SortableList, useSortableRow } from '@/components/shared/sortable-list';
import { cn } from '@/lib/utils';
import type { AboutFormValues } from './about-form-schema';

interface ValuesEditorProps {
  control: Control<AboutFormValues>;
  register: UseFormRegister<AboutFormValues>;
}

export function ValuesEditor({ control, register }: ValuesEditorProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'values' });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-ink-muted">No values added yet.</p>
      )}

      <SortableList
        ids={fields.map((field) => field.id)}
        onReorder={(oldIndex, newIndex) => move(oldIndex, newIndex)}
      >
        {fields.map((field, index) => (
          <ValueRow
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
        onClick={() => append({ title: '', description: '' })}
      >
        <Plus size={14} />
        Add value
      </Button>
    </div>
  );
}

interface ValueRowProps {
  id: string;
  index: number;
  register: UseFormRegister<AboutFormValues>;
  onRemove: () => void;
}

function ValueRow({ id, index, register, onRemove }: ValueRowProps) {
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
        <Input
          placeholder="Title (e.g. Craftsmanship)"
          {...register(`values.${index}.title` as const)}
        />
        <Textarea
          placeholder="Description"
          rows={2}
          {...register(`values.${index}.description` as const)}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-2 text-ink-muted hover:bg-rust-light hover:text-rust"
        aria-label="Remove value"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
