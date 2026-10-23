import { AlertTriangle, AlertOctagon, Check } from 'lucide-react';

/**
 * Notice displayed when recovery is pending or persistence is blocked.
 * Has role="alert" and id="recovery-notice" for aria-describedby references.
 */
export default function RecoveryNotice({
  recoveryState,
  loadStatus,
  backupKey,
  skippedCount,
  onAcknowledge,
}) {
  if (recoveryState !== 'recoveryPending' && recoveryState !== 'persistenceBlocked') {
    return null;
  }

  const isBlocked = recoveryState === 'persistenceBlocked';

  return (
    <div
      id="recovery-notice"
      role="alert"
      className={`mx-4 sm:mx-6 mt-4 p-4 rounded-xl border ${
        isBlocked
          ? 'bg-red-50 border-red-300 text-red-900'
          : 'bg-amber-50 border-amber-300 text-amber-900'
      }`}
    >
      <div className="flex items-start gap-3">
        {isBlocked ? (
          <AlertOctagon size={22} className="text-red-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-base mb-1">
            {isBlocked
              ? 'Warning: Data Backup Failed — Persistence Blocked'
              : loadStatus === 'corrupt'
              ? 'Corrupted Data Detected & Backed Up'
              : 'Partially Invalid Data Detected & Backed Up'}
          </h4>

          {isBlocked ? (
            <p className="text-red-800 leading-relaxed">
              Corrupted or invalid transaction data was found in Local Storage, but creating a safety
              backup failed. Continuing without a successful backup may overwrite or destroy the
              original stored data when new transactions are saved.
            </p>
          ) : loadStatus === 'corrupt' ? (
            <p className="text-amber-800 leading-relaxed">
              Stored transaction data was corrupted and could not be parsed as a valid list.
              {backupKey ? (
                <>
                  {' '}
                  A safety backup of the original raw data was preserved under the key:{' '}
                  <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-950 font-mono text-xs">
                    {backupKey}
                  </code>
                  .
                </>
              ) : null}{' '}
              The application has started with an empty transaction list. Transaction editing is
              temporarily disabled until you acknowledge this notice.
            </p>
          ) : (
            <p className="text-amber-800 leading-relaxed">
              Found {skippedCount} invalid or malformed transaction {skippedCount === 1 ? 'record' : 'records'},
              which {skippedCount === 1 ? 'was' : 'were'} safely skipped. Valid transactions have been loaded.
              {backupKey ? (
                <>
                  {' '}
                  A safety backup of the original raw data was saved to key:{' '}
                  <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-950 font-mono text-xs">
                    {backupKey}
                  </code>
                  .
                </>
              ) : null}{' '}
              Transaction editing is temporarily disabled until you acknowledge this notice.
            </p>
          )}

          <div className="mt-3">
            <button
              onClick={onAcknowledge}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                isBlocked
                  ? 'bg-red-700 hover:bg-red-800 text-white'
                  : 'bg-amber-700 hover:bg-amber-800 text-white'
              }`}
            >
              <Check size={14} />
              {isBlocked ? 'Acknowledge Risk and Enable Editing' : 'Acknowledge and Resume'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
