import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/features/auth/auth-context';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import {
  useUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from './users-api';
import { UserCreateDialog } from './user-create-dialog';
import type { User, UserStatus } from '@/types/user';
import type { UserRole } from '@/types/auth';

const PAGE_LIMIT = 20;

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export function UserListPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
  });
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const items = data?.items ?? [];
  // Role/delete are SUPER_ADMIN-only on the backend (`@Roles(UserRole.SUPER_ADMIN)`
  // on those three routes); status toggle is open to ADMIN too, since it
  // inherits the controller's class-level `@Roles(SUPER_ADMIN, ADMIN)`
  // instead of overriding it. Mirrored here so an ADMIN sees read-only
  // controls instead of ones that would just 403.
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canToggleStatus = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleRoleFilterChange(value: string) {
    setRole(value as UserRole | '');
    setPage(1);
  }

  function handleStatusFilterChange(value: string) {
    setStatus(value as UserStatus | '');
    setPage(1);
  }

  function handleRoleChange(userId: string, nextRole: UserRole) {
    updateRole.mutate(
      { id: userId, role: nextRole },
      {
        onError: (error) => toast.error("Couldn't update role", getErrorMessage(error)),
      },
    );
  }

  function handleStatusToggle(row: User) {
    const nextStatus: UserStatus = row.status === 'active' ? 'inactive' : 'active';
    updateStatus.mutate(
      { id: row._id, status: nextStatus },
      {
        onError: (error) => toast.error("Couldn't update status", getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteUser.mutateAsync(pendingDelete._id);
      toast.success('User deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error("Couldn't delete user", getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">
            {row.name}
            {row._id === currentUser?.id && (
              <span className="ml-1.5 text-xs font-normal text-ink-muted">(you)</span>
            )}
          </p>
          <p className="text-xs text-ink-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => {
        const isSelf = row._id === currentUser?.id;
        if (!isSuperAdmin || isSelf) {
          return (
            <Badge variant={row.role === 'super_admin' ? 'neutral' : 'inactive'}>
              {ROLE_LABELS[row.role]}
            </Badge>
          );
        }
        return (
          <Select
            value={row.role}
            onChange={(event) => handleRoleChange(row._id, event.target.value as UserRole)}
            disabled={updateRole.isPending}
            className="h-8 max-w-40 text-xs"
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </Select>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const isSelf = row._id === currentUser?.id;
        const canToggleThisRow = canToggleStatus && !isSelf;
        return (
          <button
            type="button"
            onClick={() => canToggleThisRow && handleStatusToggle(row)}
            disabled={!canToggleThisRow || updateStatus.isPending}
            className={canToggleThisRow ? 'cursor-pointer' : 'cursor-default'}
            aria-label={canToggleThisRow ? `Toggle status for ${row.name}` : undefined}
          >
            <Badge variant={row.status === 'active' ? 'active' : 'inactive'} className="capitalize">
              {row.status}
            </Badge>
          </button>
        );
      },
    },
    {
      key: 'lastLoginAt',
      header: 'Last login',
      render: (row) => (
        <span className="text-sm text-ink-muted">
          {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-16',
      className: 'text-right',
      render: (row) => {
        const isSelf = row._id === currentUser?.id;
        if (!isSuperAdmin || isSelf) return null;
        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPendingDelete(row)}
              className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
              aria-label={`Delete ${row.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="CMS admins, editors, and their access levels."
        action={
          isSuperAdmin ? (
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} />
              New user
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="max-w-xs"
        />
        <Select
          value={role}
          onChange={(event) => handleRoleFilterChange(event.target.value)}
          className="max-w-40"
        >
          <option value="">All roles</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        <Select
          value={status}
          onChange={(event) => handleStatusFilterChange(event.target.value)}
          className="max-w-40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No users found"
        emptyDescription="Try a different search or filter."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <UserCreateDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this user?"
        description="They'll lose access to the CMS immediately. This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteUser.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
