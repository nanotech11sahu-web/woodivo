import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useCreateUser } from './users-api';
import { userFormSchema, USER_FORM_DEFAULTS, type UserFormValues } from './user-form-schema';

interface UserCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

// A dialog rather than a `/users/new` route, unlike every other module's
// create flow — there's no multi-section form here (no images, no SEO
// fields, no rich text), just four inputs, so a full page would mostly be
// whitespace. `ConfirmDialog` already established that this codebase's
// `Dialog` primitive can hold more than a yes/no prompt.
export function UserCreateDialog({ open, onClose }: UserCreateDialogProps) {
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: USER_FORM_DEFAULTS,
  });

  function handleClose() {
    reset(USER_FORM_DEFAULTS);
    onClose();
  }

  async function onSubmit(values: UserFormValues) {
    try {
      await createUser.mutateAsync(values);
      toast.success('User created');
      handleClose();
    } catch (error) {
      toast.error("Couldn't create user", getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="New user"
      description="They'll be able to sign in with this email and password right away."
    >
      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="mt-1.5" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-rust">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-1.5" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-rust">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1.5"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-rust">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select id="role" className="mt-1.5" {...register('role')}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            Create user
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
