import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/shared/image-uploader';
import { DragHandle, SortableList, useSortableRow } from '@/components/shared/sortable-list';
import { cn } from '@/lib/utils';
import type { AboutFormValues } from './about-form-schema';
import type { MediaAsset } from '@/types/common';

interface TeamMembersEditorProps {
  control: Control<AboutFormValues>;
  register: UseFormRegister<AboutFormValues>;
  photos: (MediaAsset | undefined)[];
  onPhotosChange: (photos: (MediaAsset | undefined)[]) => void;
}

/**
 * `photo` isn't a validated form field (same reason `logo`/`favicon` sit
 * outside settingsFormSchema in the Settings page) — it's an uploaded
 * MediaAsset, not text input. Kept as a parent-held array, index-aligned
 * with the `teamMembers` field array. append/remove/reorder here touch
 * both arrays together so a row's photo doesn't silently shift onto a
 * different member.
 *
 * Reordering is the one place this alignment needs active work rather
 * than just append/remove: `move()` (from `useFieldArray`) only reorders
 * `teamMembers`, so `handleReorder` below does the matching splice on
 * `photos` itself — same "index-aligned sibling array, kept in lockstep
 * by hand" shape `handleAppend`/`handleRemove` already established.
 */
export function TeamMembersEditor({
  control,
  register,
  photos,
  onPhotosChange,
}: TeamMembersEditorProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'teamMembers' });

  function handleAppend() {
    append({ name: '', role: '', bio: '' });
    onPhotosChange([...photos, undefined]);
  }

  function handleRemove(index: number) {
    remove(index);
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  function handleReorder(oldIndex: number, newIndex: number) {
    move(oldIndex, newIndex);
    const next = [...photos];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onPhotosChange(next);
  }

  function handlePhotoChange(index: number, asset: MediaAsset | undefined) {
    const next = [...photos];
    next[index] = asset;
    onPhotosChange(next);
  }

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-ink-muted">No team members added yet.</p>
      )}

      <SortableList ids={fields.map((field) => field.id)} onReorder={handleReorder}>
        {fields.map((field, index) => (
          <TeamMemberRow
            key={field.id}
            id={field.id}
            index={index}
            register={register}
            photo={photos[index]}
            onPhotoChange={(asset) => handlePhotoChange(index, asset)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </SortableList>

      <Button type="button" variant="secondary" size="sm" onClick={handleAppend}>
        <Plus size={14} />
        Add team member
      </Button>
    </div>
  );
}

interface TeamMemberRowProps {
  id: string;
  index: number;
  register: UseFormRegister<AboutFormValues>;
  photo: MediaAsset | undefined;
  onPhotoChange: (asset: MediaAsset | undefined) => void;
  onRemove: () => void;
}

function TeamMemberRow({ id, index, register, photo, onPhotoChange, onRemove }: TeamMemberRowProps) {
  const { setNodeRef, style, dragHandleProps, isDragging } = useSortableRow(id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-3 rounded-md border border-border-warm bg-card p-3',
        isDragging && 'z-10 opacity-90 shadow-lg',
      )}
    >
      <DragHandle {...dragHandleProps} className="mt-1" />
      <ImageUploader label="Photo" value={photo} onChange={onPhotoChange} folder="about" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Name"
            className="flex-1"
            {...register(`teamMembers.${index}.name` as const)}
          />
          <Input
            placeholder="Role (e.g. Master Craftsman)"
            className="flex-1"
            {...register(`teamMembers.${index}.role` as const)}
          />
        </div>
        <Textarea
          placeholder="Bio (optional)"
          rows={2}
          {...register(`teamMembers.${index}.bio` as const)}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-2 text-ink-muted hover:bg-rust-light hover:text-rust"
        aria-label="Remove team member"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
