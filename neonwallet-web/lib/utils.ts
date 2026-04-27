import { Transaction } from './store';

export function exportToCSV(transactions: Transaction[], currency = 'GHS') {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Network'];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.category,
    t.amount.toFixed(2),
    `"${t.note.replace(/"/g, '""')}"`,
    t.network || '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neonwallet_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(transactions: Transaction[]) {
  const json = JSON.stringify(transactions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neonwallet_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrency(amount: number, currency = 'GHS') {
  return `${currency} ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
