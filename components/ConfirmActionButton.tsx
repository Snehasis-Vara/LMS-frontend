'use client';

import { ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface ConfirmActionButtonProps {
  action: 'delete' | 'edit' | 'add' | 'remove' | 'return' | 'issue' | 'renew' | 'logout';
  itemName?: string;
  onConfirm: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const actionConfig = {
  delete: {
    title: 'Delete Confirmation',
    description: (item: string) => `Are you sure you want to delete ${item}? This action cannot be undone.`,
    actionLabel: 'Delete',
    variant: 'destructive' as const,
  },
  remove: {
    title: 'Remove Confirmation',
    description: (item: string) => `Are you sure you want to remove ${item}?`,
    actionLabel: 'Remove',
    variant: 'destructive' as const,
  },
  edit: {
    title: 'Edit Confirmation',
    description: (item: string) => `Are you sure you want to edit ${item}?`,
    actionLabel: 'Edit',
    variant: 'default' as const,
  },
  add: {
    title: 'Add Confirmation',
    description: (item: string) => `Are you sure you want to add ${item}?`,
    actionLabel: 'Add',
    variant: 'default' as const,
  },
  return: {
    title: 'Return Book',
    description: (item: string) => `Confirm book return${item ? ` for ${item}` : ''}? Any applicable fines will be calculated.`,
    actionLabel: 'Return',
    variant: 'default' as const,
  },
  issue: {
    title: 'Issue Book',
    description: (item: string) => `Confirm issuing ${item}? The book will be due in 14 days.`,
    actionLabel: 'Issue',
    variant: 'default' as const,
  },
  renew: {
    title: 'Renew Book',
    description: (item: string) => `Confirm renewal${item ? ` for ${item}` : ''}? This will extend the due date by 7 days.`,
    actionLabel: 'Renew',
    variant: 'default' as const,
  },
  logout: {
    title: 'Logout',
    description: () => 'Are you sure you want to logout?',
    actionLabel: 'Logout',
    variant: 'default' as const,
  },
};

export function ConfirmActionButton({
  action,
  itemName = 'this item',
  onConfirm,
  children,
  className,
  disabled,
}: ConfirmActionButtonProps) {
  const config = actionConfig[action];

  const trigger = (
    <button className={className} disabled={disabled} type="button">
      {children}
    </button>
  );

  return (
    <ConfirmDialog
      trigger={trigger}
      title={config.title}
      description={config.description(itemName)}
      actionLabel={config.actionLabel}
      onConfirm={onConfirm}
      variant={config.variant}
    />
  );
}
