import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} description={description}>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={destructive ? 'destructive' : 'primary'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && <Spinner className="text-current" />}
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
