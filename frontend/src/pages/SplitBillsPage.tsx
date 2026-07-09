import { useEffect, useState } from 'react';
import { splitBillService } from '../services/splitBillService';
import type { SplitBill, Debt } from '../services/splitBillService';
import { getAccounts } from '../lib/accountApi';
import type { Account } from '../types/account';
import CreateSplitBillModal from '../components/splitbill/CreateSplitBillModal';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { Trash2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function SplitBillsPage() {
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<'bills' | 'debts'>('bills');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, d, a] = await Promise.all([
        splitBillService.getSplitBills(),
        splitBillService.getDebts(),
        getAccounts(),
      ]);
      setSplitBills(b);
      setDebts(d);
      setAccounts(a);
    } catch (err) {
      console.error('Failed to load split bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalUnpaidReceivables = debts
    .filter((d) => !d.isPaid && d.type === 'receivable')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleMarkPaid = async (id: string) => {
    try {
      await splitBillService.markDebtPaid(id);
      loadData();
    } catch (err) {
      alert('Failed to mark debt as paid');
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (!confirm('Delete this friend debt record?')) return;
    try {
      await splitBillService.deleteDebt(id);
      loadData();
    } catch (err) {
      alert('Failed to delete debt');
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Delete this split-bill session?')) return;
    try {
      await splitBillService.deleteSplitBill(id);
      loadData();
    } catch (err) {
      alert('Failed to delete split bill');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Split-Bill & Debts"
          description="GoPay-style receipt scanning, itemized proportional tax calculation, and friend IOU tracking."
        />
        <div>
          <Button onClick={() => setIsModalOpen(true)}>Add Split-Bill</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Unpaid Friend Receivables
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            {currencyFormatter.format(totalUnpaidReceivables)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            From {debts.filter((d) => !d.isPaid).length} pending friend debts
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Split-Bill Sessions</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            {splitBills.length} Sessions
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Supports manual entry & receipt scan (OCR)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-3 text-sm font-semibold transition relative ${
            activeTab === 'bills'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Split-Bill Sessions ({splitBills.length})
        </button>
        <button
          onClick={() => setActiveTab('debts')}
          className={`pb-3 text-sm font-semibold transition relative ${
            activeTab === 'debts'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Friend Debts / IOUs ({debts.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading split bills...</div>
      ) : activeTab === 'bills' ? (
        <div className="space-y-4">
          {splitBills.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 dark:border-slate-800/80 dark:bg-slate-900/80">
              <EmptyState
                title="No split bills recorded yet"
                description="Click 'Add Split-Bill' to split cafe or restaurant bills manually or via receipt scan."
              />
            </div>
          ) : (
            splitBills.map((bill) => {
              const participantsList = bill.participants || [];
              const paidCount = participantsList.filter((p) => p.isPaid).length;
              const totalCount = participantsList.length;
              const allPaid = totalCount > 0 && paidCount === totalCount;

              return (
                <div
                  key={bill.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {bill.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            allPaid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          }`}
                        >
                          {allPaid ? 'All Paid' : `${paidCount}/${totalCount} Paid`}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Total: {currencyFormatter.format(Number(bill.totalAmount))}</span>
                        <span>•</span>
                        <span>Your Share: {currencyFormatter.format(Number(bill.myShare))}</span>
                        <span>•</span>
                        <span className="capitalize font-semibold text-primary-600 dark:text-primary-400">
                          Method: {bill.splitMethod}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 self-start sm:self-center transition"
                      title="Delete split bill session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* GoPay Style Participants List */}
                  <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    {participantsList.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                          p.isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-300'
                        }`}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 font-bold uppercase">
                          {p.name.charAt(0)}
                        </div>
                        <span>
                          {p.name}: {currencyFormatter.format(Number(p.shareAmount))}
                        </span>
                        <span className="text-[10px] uppercase font-bold ml-0.5">
                          {p.isPaid ? '✓ Paid' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {debts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 dark:border-slate-800/80 dark:bg-slate-900/80">
              <EmptyState
                title="All friend debts settled"
                description="You have no outstanding friend debts or IOUs at the moment."
              />
            </div>
          ) : (
            debts.map((debt) => (
              <div
                key={debt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white uppercase shadow-sm">
                    {debt.friendName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {debt.friendName}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          debt.isPaid
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {debt.isPaid ? '✓ Paid' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {debt.description || 'Split-Bill IOU'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {currencyFormatter.format(Number(debt.amount))}
                  </span>
                  {!debt.isPaid && (
                    <button
                      onClick={() => handleMarkPaid(debt.id)}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 transition"
                    >
                      ✓ Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CreateSplitBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        accounts={accounts}
      />
    </div>
  );
}
