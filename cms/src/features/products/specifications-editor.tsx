import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DragHandle, SortableList, useSortableRow } from '@/components/shared/sortable-list';
import { cn } from '@/lib/utils';
import type { ProductFormValues } from './product-form-schema';

interface SpecificationsEditorProps {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
}

export function SpecificationsEditor({ control, register }: SpecificationsEditorProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'specifications' });

  return (
    <div className="space-y-2">
      {fields.length === 0 && (
        <p className="text-sm text-ink-muted">No specifications added yet.</p>
      )}

      <SortableList
        ids={fields.map((field) => field.id)}
        onReorder={(oldIndex, newIndex) => move(oldIndex, newIndex)}
      >
        {fields.map((field, index) => (
          <SpecificationRow
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
        onClick={() => append({ key: '', value: '' })}
      >
        <Plus size={14} />
        Add specification
      </Button>
    </div>
  );
}

interface SpecificationRowProps {
  id: string;
  index: number;
  register: UseFormRegister<ProductFormValues>;
  onRemove: () => void;
}

function SpecificationRow({ id, index, register, onRemove }: SpecificationRowProps) {
  const { setNodeRef, style, dragHandleProps, isDragging } = useSortableRow(id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md bg-card p-1',
        isDragging && 'z-10 opacity-90 shadow-lg',
      )}
    >
      <DragHandle {...dragHandleProps} />
      <Input
        placeholder="Key (e.g. Material)"
        className="max-w-48"
        {...register(`specifications.${index}.key` as const)}
      />
      <Input
        placeholder="Value (e.g. Sheesham wood)"
        className="flex-1"
        {...register(`specifications.${index}.value` as const)}
      />
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-2 text-ink-muted hover:bg-rust-light hover:text-rust"
        aria-label="Remove specification"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
