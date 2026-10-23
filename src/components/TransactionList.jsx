import TransactionItem from './TransactionItem.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * Transaction list that renders items or an empty state.
 */
export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  canMutate,
  mutationBlockedReason,
  emptyTitle,
  emptyMessage,
  emptyAction,
  emptyActionLabel,
  emptySecondaryAction,
  emptySecondaryActionLabel,
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        actionLabel={emptyActionLabel}
        secondaryAction={emptySecondaryAction}
        secondaryActionLabel={emptySecondaryActionLabel}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
          canMutate={canMutate}
          mutationBlockedReason={mutationBlockedReason}
        />
      ))}
    </div>
  );
}
