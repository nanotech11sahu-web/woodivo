import type { ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared drag-and-drop reorder primitive for the five CMS array editors
 * that needed one (`specifications-editor.tsx`, `values-editor.tsx`,
 * `milestones-editor.tsx`, `team-members-editor.tsx`,
 * `homepage-highlights-editor.tsx` — flagged Phase 23, built Phase 30).
 *
 * One `@dnd-kit` setup lives here instead of five, since every editor
 * needs the identical shape: a `DndContext` + `SortableContext` around a
 * `useFieldArray` list, keyed by RHF's own per-row `field.id` (stable
 * across reorders, unlike `index`), reporting reorders back as a plain
 * `(oldIndex, newIndex)` pair. Every editor already gets a `move()`
 * function from its own `useFieldArray` call (used by
 * `homepage-highlights-editor.tsx`'s old up/down buttons, now removed in
 * favour of this) — `SortableList` doesn't touch form state itself, it
 * only tells the caller which two indexes swapped and lets each editor's
 * own `move()` (and, for `team-members-editor.tsx`, the parallel `photos`
 * array's own reorder) do the rest.
 *
 * Pointer + keyboard sensors both included: keyboard reordering (space to
 * pick up, arrow keys to move, space to drop) is `@dnd-kit`'s built-in
 * accessible fallback for anyone not using a mouse/touch, not an extra
 * feature this phase had to build.
 */
interface SortableListProps {
  ids: string[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: ReactNode;
}

export function SortableList({ ids, onReorder, children }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/**
 * Per-row hook, not a wrapping component — every editor's row markup
 * already differs too much (icon `<Select>` here, `ImageUploader` there,
 * a two-column year/title split elsewhere) for a one-size row component
 * to hold. Each editor calls this with its row's `field.id` and spreads
 * the result onto its own existing row `<div>` plus renders
 * `<DragHandle {...dragHandleProps} />` wherever its layout wants the
 * grip, instead of `SortableList` dictating that layout.
 */
export function useSortableRow(id: string) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return {
    setNodeRef,
    style: {
      transform: CSS.Transform.toString(transform),
      transition,
    },
    dragHandleProps: { ...attributes, ...listeners },
    isDragging,
  };
}

interface DragHandleProps {
  className?: string;
  [key: string]: unknown;
}

/** Grip icon + the props `useSortableRow` hands back, spread onto it. */
export function DragHandle({ className, ...dragHandleProps }: DragHandleProps) {
  return (
    <button
      type="button"
      className={cn(
        'shrink-0 cursor-grab touch-none rounded p-1.5 text-ink-muted hover:bg-sand hover:text-espresso active:cursor-grabbing',
        className,
      )}
      aria-label="Drag to reorder"
      {...dragHandleProps}
    >
      <GripVertical size={15} />
    </button>
  );
}
