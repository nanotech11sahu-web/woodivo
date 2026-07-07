import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DragHandle, SortableList, useSortableRow } from '@/components/shared/sortable-list';
import { cn } from '@/lib/utils';
import type { AboutFormValues } from './about-form-schema';

interface MilestonesEditorProps {
  control: Control<AboutFormValues>;
  register: UseFormRegister<AboutFormValues>;
}

export function MilestonesEditor({ control, register }: MilestonesEditorProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'milestones' });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-ink-muted">No milestones added yet.</p>
      )}

      <SortableList
        ids={fields.map((field) => field.id)}
        onReorder={(oldIndex, newIndex) => move(oldIndex, newIndex)}
      >
        {fields.map((field, index) => (
          <MilestoneRow
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
        onClick={() => append({ year: '', title: '', description: '' })}
      >
        <Plus size={14} />
        Add milestone
      </Button>
    </div>
  );
}

interface MilestoneRowProps {
  id: string;
  index: number;
  register: UseFormRegister<AboutFormValues>;
  onRemove: () => void;
}

function MilestoneRow({ id, index, register, onRemove }: MilestoneRowProps) {
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
        <div className="flex gap-2">
          <Input
            placeholder="Year (e.g. 2015)"
            className="max-w-28"
            {...register(`milestones.${index}.year` as const)}
          />
          <Input
            placeholder="Title (e.g. Workshop founded)"
            className="flex-1"
            {...register(`milestones.${index}.title` as const)}
          />
        </div>
        <Textarea
          placeholder="Description (optional)"
          rows={2}
          {...register(`milestones.${index}.description` as const)}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-2 text-ink-muted hover:bg-rust-light hover:text-rust"
        aria-label="Remove milestone"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
