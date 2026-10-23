import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import App from '../App.jsx';
import TransactionItem from '../components/TransactionItem.jsx';
import { STORAGE_KEY } from '../utils/storage.js';
import { generateSampleData } from '../utils/sampleData.js';

describe('Hooks and Components Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('under <StrictMode>, no write to the main key occurs on mount before user mutation', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Initial mount under StrictMode must NOT write to LocalStorage
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('under <StrictMode> with corrupted data, does not write to main key on mount', async () => {
    const corruptData = 'invalid-json-data-###';
    localStorage.setItem(STORAGE_KEY, corruptData);

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Main key must remain untouched with original corrupt data
    expect(localStorage.getItem(STORAGE_KEY)).toBe(corruptData);

    // Alert notice should appear
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Corrupted Data Detected/i)).toBeInTheDocument();
  });

  it('recovery backup creation is idempotent for a recovery attempt under StrictMode', async () => {
    const corruptData = '{ "malformed": ';
    localStorage.setItem(STORAGE_KEY, corruptData);

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    await screen.findByRole('alert');

    // Count backup keys in storage
    const backupKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith('expense-tracker-transactions-v1-corrupt-backup-'),
    );

    // Exactly one backup must exist, despite StrictMode's double effect execution!
    expect(backupKeys.length).toBe(1);
    expect(localStorage.getItem(backupKeys[0])).toBe(corruptData);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(corruptData);
  });

  it('disables Add, Edit, Delete, and sample data while recovery is unacknowledged', async () => {
    const partialData = JSON.stringify([
      {
        id: '1',
        title: 'Valid Tx',
        amount: 500,
        type: 'income',
        category: 'Salary',
        date: '2026-10-01',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
        isSample: false,
      },
      { id: '2', title: '' }, // malformed
    ]);
    localStorage.setItem(STORAGE_KEY, partialData);

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Recovery notice is shown
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Add Transaction button in header should be disabled
    const addBtn = document.getElementById('header-add-transaction');
    expect(addBtn).toBeDisabled();

    // Acknowledge notice
    const ackBtn = screen.getByRole('button', { name: /Acknowledge and Resume/i });
    fireEvent.click(ackBtn);

    // After acknowledgment, Add button is enabled!
    expect(addBtn).not.toBeDisabled();
  });

  it('adding a transaction writes to storage only after explicit user submission', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Click Add Transaction via header button
    const addBtn = document.getElementById('header-add-transaction');
    await user.click(addBtn);

    // Modal dialog should open
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Fill form
    const titleInput = screen.getByLabelText(/Title/i);
    const amountInput = screen.getByLabelText(/Amount/i);

    await user.type(titleInput, 'Coffee');
    await user.type(amountInput, '150.50');

    // Submit form using submit button within dialog
    const submitBtn = within(dialog).getByRole('button', { name: 'Add Transaction' });
    await user.click(submitBtn);

    // Dialog closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Storage now contains the saved transaction
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe('Coffee');
    expect(saved[0].amount).toBe(150.5);
  });

  it('resets category when changing type in Add form if category is invalid for new type', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Open add dialog
    await user.click(document.getElementById('header-add-transaction'));

    const categorySelect = screen.getByLabelText(/Category/i);
    // Default is expense with Food
    expect(categorySelect.value).toBe('Food');

    // Switch type to Income
    const incomeRadio = screen.getByLabelText(/\+ Income/i);
    await user.click(incomeRadio);

    // Food is not an income category, so category resets to first valid income category (Salary)
    expect(categorySelect.value).toBe('Salary');
  });

  it('announces amount validation errors without closing modal', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    await user.click(document.getElementById('header-add-transaction'));
    const dialog = await screen.findByRole('dialog');

    await user.type(screen.getByLabelText(/Title/i), 'Test item');
    await user.type(screen.getByLabelText(/Amount/i), '1,000'); // comma is rejected

    const submitBtn = within(dialog).getByRole('button', { name: 'Add Transaction' });
    await user.click(submitBtn);

    // Error announced
    expect(
      screen.getByText('Enter digits only, without commas (for example 1500 or 1500.50).'),
    ).toBeInTheDocument();
    // Modal remains open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancel in delete and edit leave data unchanged', async () => {
    const user = userEvent.setup();
    const existing = [
      {
        id: 'tx-existing',
        title: 'Original Title',
        amount: 200,
        type: 'expense',
        category: 'Food',
        date: '2026-10-23',
        notes: '',
        createdAt: '2026-10-23T10:00:00Z',
        updatedAt: '2026-10-23T10:00:00Z',
        isSample: false,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Switch to Transactions view to see items
    await user.click(screen.getAllByRole('button', { name: 'Transactions' })[0]);

    // Click delete button
    const deleteBtn = screen.getByLabelText(/Delete Original Title/i);
    await user.click(deleteBtn);

    // Confirm dialog opened
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    // Cancel delete
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Dialog closed and transaction is still present
    expect(screen.getByText('Original Title')).toBeInTheDocument();
  });

  it('Clear Filters restores monthScope to "selected"', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Navigate to transactions view
    await user.click(screen.getAllByRole('button', { name: 'Transactions' })[0]);

    // Change month scope to "All months"
    const monthScopeSelect = screen.getByLabelText(/Month scope/i);
    await user.selectOptions(monthScopeSelect, 'all');
    expect(monthScopeSelect.value).toBe('all');

    // Click Clear Filters
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    await user.click(clearBtn);

    // Month scope reset to 'selected'
    expect(monthScopeSelect.value).toBe('selected');
  });

  it('selecting All months does not change the global selectedMonth', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Check header month
    const getMonthSelectorText = () =>
      screen.getByLabelText(/Previous month/i).parentElement.textContent;

    expect(getMonthSelectorText()).toContain('October 2026');

    // Navigate to transactions
    await user.click(screen.getAllByRole('button', { name: 'Transactions' })[0]);

    // Select All months in filter
    const monthScopeSelect = screen.getByLabelText(/Month scope/i);
    await user.selectOptions(monthScopeSelect, 'all');

    // Header month is unchanged!
    expect(getMonthSelectorText()).toContain('October 2026');
  });

  it('sample data generation at a mocked time covers 6 calendar months', () => {
    const mockDate = new Date('2026-10-23T15:00:00+05:30');
    vi.setSystemTime(mockDate);

    const sample = generateSampleData();
    expect(sample.length).toBeGreaterThanOrEqual(12);

    const months = new Set(sample.map((t) => t.date.slice(0, 7)));
    expect(months.size).toBe(6);
    expect(months.has('2026-10')).toBe(true);
    expect(months.has('2026-05')).toBe(true);

    vi.useRealTimers();
  });

  it('editing a sample transaction sets isSample to false and survives sample removal', async () => {
    const user = userEvent.setup();
    const sampleRecord = {
      id: 'sample-1',
      title: 'Sample Groceries',
      amount: 1200,
      type: 'expense',
      category: 'Food',
      date: '2026-10-20',
      notes: '',
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
      isSample: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleRecord]));

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Open Transactions view
    await user.click(screen.getAllByRole('button', { name: 'Transactions' })[0]);

    // Edit transaction
    await user.click(screen.getByLabelText(/Edit Sample Groceries/i));

    // Update title
    const titleInput = screen.getByLabelText(/Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'My Real Groceries');

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    // Now it is user-modified, so sampleCount is 0 (isSample === false)
    expect(screen.queryByText(/Remove Sample Data/i)).not.toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored[0].isSample).toBe(false);
    expect(stored[0].title).toBe('My Real Groceries');
  });

  it('shows persistence banner on storage failure and retry re-attempts saving', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Mock storage setItem to throw via prototype spy
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    // Add a transaction
    await user.click(document.getElementById('header-add-transaction'));
    const dialog = await screen.findByRole('dialog');
    await user.type(screen.getByLabelText(/Title/i), 'Test Failed Storage');
    await user.type(screen.getByLabelText(/Amount/i), '100');
    const submitBtn = within(dialog).getByRole('button', { name: 'Add Transaction' });
    await user.click(submitBtn);

    // Banner is visible
    expect(await screen.findByText(/Storage is unavailable/i)).toBeInTheDocument();

    // Restore setItem spy
    setItemSpy.mockRestore();

    // Click Retry
    const retryBtn = screen.getByRole('button', { name: /Retry Saving/i });
    await user.click(retryBtn);

    // Banner should be cleared after successful retry
    await waitFor(() => {
      expect(screen.queryByText(/Storage is unavailable/i)).not.toBeInTheDocument();
    });
  });

  it('TransactionItem renders long title, long notes, large INR amount (₹1,00,000.00), and long category/date without overlap or layout breakage', () => {
    const longTx = {
      id: 'tx-long-test',
      title: 'Annual Enterprise Cloud Infrastructure & Distributed Kubernetes Hosting Subscription',
      amount: 100000,
      type: 'income',
      category: 'Technology, Office Equipment & Enterprise Subscriptions',
      date: '2026-10-15',
      notes: 'Quarterly invoice #98234-B covering high-availability multi-region cluster setup with automated failover and 99.99% uptime SLA guarantee',
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-15T10:00:00Z',
      isSample: false,
    };

    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <TransactionItem
        transaction={longTx}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canMutate={true}
        mutationBlockedReason=""
      />,
    );

    // 1. Long title should be rendered with break-words class
    const titleEl = screen.getByText(longTx.title);
    expect(titleEl).toBeInTheDocument();
    expect(titleEl.className).toContain('break-words');
    expect(titleEl.className).toContain('line-clamp-2');

    // 2. Large amount ₹1,00,000.00 should be formatted with + and whitespace-nowrap
    const amountEl = screen.getByText(/\+\s*₹1,00,000\.00/);
    expect(amountEl).toBeInTheDocument();
    expect(amountEl.className).toContain('whitespace-nowrap');
    expect(amountEl.className).toContain('text-emerald-600');

    // 3. Category should be rendered with break-words
    const categoryEl = screen.getByText(longTx.category);
    expect(categoryEl).toBeInTheDocument();
    expect(categoryEl.className).toContain('break-words');

    // 4. Date formatted as "Oct 15, 2026" should be rendered
    const dateEl = screen.getByText('Oct 15, 2026');
    expect(dateEl).toBeInTheDocument();
    expect(dateEl.className).toContain('whitespace-nowrap');

    // 5. Long notes should be rendered with break-words
    const notesEl = screen.getByText(longTx.notes);
    expect(notesEl).toBeInTheDocument();
    expect(notesEl.className).toContain('break-words');

    // 6. Action buttons should have accessible labels and touch-target classes
    const editBtn = screen.getByRole('button', { name: `Edit ${longTx.title}` });
    const deleteBtn = screen.getByRole('button', { name: `Delete ${longTx.title}` });
    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();
    expect(editBtn.className).toContain('min-w-[32px]');
    expect(deleteBtn.className).toContain('min-w-[32px]');
  });

  it('Dashboard Recent Transactions displays large ₹1,00,000.00 transaction and long metadata', async () => {
    const longTx = {
      id: 'tx-recent-large',
      title: 'Major Consulting Retainer & Advisory Contract for Q4 FY2026',
      amount: 100000,
      type: 'income',
      category: 'Salary',
      date: '2026-10-20',
      notes: 'Wire transfer confirmed with reference #WT-2026-991823',
      createdAt: '2026-10-20T12:00:00Z',
      updatedAt: '2026-10-20T12:00:00Z',
      isSample: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([longTx]));

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // Dashboard Recent Transactions section should render the transaction
    const recentSection = screen.getByRole('region', { name: /Recent transactions/i });
    expect(recentSection).toBeInTheDocument();

    const titleEl = within(recentSection).getByText(longTx.title);
    expect(titleEl).toBeInTheDocument();

    const amountEl = within(recentSection).getByText(/\+\s*₹1,00,000\.00/);
    expect(amountEl).toBeInTheDocument();

    const dateEl = within(recentSection).getByText('Oct 20, 2026');
    expect(dateEl).toBeInTheDocument();
  });
});
