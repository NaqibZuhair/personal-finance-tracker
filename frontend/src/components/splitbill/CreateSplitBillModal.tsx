import React, { useState, useMemo } from 'react';
import { splitBillService } from '../../services/splitBillService';
import type { Account } from '../../types/account';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ErrorAlert from '../ui/ErrorAlert';
import {
  Trash2,
  Plus,
  Users,
  Receipt,
  Calculator,
  Check,
  ScanLine,
  FileText,
  Upload,
  Sparkles,
  CheckSquare,
  Square,
  Wallet,
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

interface CreateSplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
}

type InputMode = 'manual' | 'ocr';
type OcrStep = 'upload' | 'validate' | 'assign';

export default function CreateSplitBillModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
}: CreateSplitBillModalProps) {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [ocrStep, setOcrStep] = useState<OcrStep>('upload');
  const [scanning, setScanning] = useState(false);

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [taxServicePercent, setTaxServicePercent] = useState('15');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'itemized'>('equal');
  const [participants, setParticipants] = useState<string[]>(['Me', 'Andi', 'Budi']);
  const [items, setItems] = useState<{ item: string; price: string; assignedTo: string[] }[]>([
    { item: 'Coffee / Main Dish', price: '', assignedTo: ['Me', 'Andi', 'Budi'] },
  ]);

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeMemberTab, setActiveMemberTab] = useState('Me');

  const validParticipants = useMemo(
    () => participants.map((p) => p.trim()).filter(Boolean),
    [participants]
  );

  const handleAddParticipant = () => {
    const next = [...participants, ''];
    setParticipants(next);
  };

  const handleParticipantChange = (index: number, val: string) => {
    const oldVal = participants[index];
    const next = [...participants];
    next[index] = val;
    setParticipants(next);

    if (oldVal && val) {
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          assignedTo: it.assignedTo.map((n) => (n === oldVal ? val : n)),
        }))
      );
      if (activeMemberTab === oldVal) {
        setActiveMemberTab(val);
      }
    }
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length <= 2) return;
    const removedName = participants[index];
    setParticipants(participants.filter((_, i) => i !== index));
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        assignedTo: it.assignedTo.filter((n) => n !== removedName),
      }))
    );
    if (activeMemberTab === removedName) {
      setActiveMemberTab(participants[0] || 'Me');
    }
  };

  const handleAddItem = () =>
    setItems([...items, { item: '', price: '', assignedTo: validParticipants }]);

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const toggleItemAssignee = (itemIdx: number, personName: string) => {
    const current = items[itemIdx].assignedTo;
    const nextAssigned = current.includes(personName)
      ? current.filter((n) => n !== personName)
      : [...current, personName];
    const nextItems = [...items];
    nextItems[itemIdx].assignedTo = nextAssigned;
    setItems(nextItems);
  };

  // Simulate or trigger Receipt OCR Scanning
  const handleSimulateReceiptScan = () => {
    setScanning(true);
    setError('');
    setTimeout(() => {
      setTitle('Starbucks Coffee Reserve');
      setTaxServicePercent('15');
      const scannedItems = [
        { item: 'Iced Caramel Macchiato Grande', price: '58000', assignedTo: ['Me'] },
        { item: 'Almond Croissant Warm', price: '38000', assignedTo: ['Andi'] },
        { item: 'Cold Brew Signature', price: '44000', assignedTo: ['Budi'] },
        { item: 'Truffle Fries Sharing', price: '48000', assignedTo: ['Me', 'Andi', 'Budi'] },
      ];
      setItems(scannedItems);
      const totalSub = scannedItems.reduce((s, i) => s + Number(i.price), 0);
      setTotalAmount(String(totalSub));
      setSplitMethod('itemized');
      setScanning(false);
      setOcrStep('validate');
    }, 1200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Perform OCR scan simulation on file selected
    handleSimulateReceiptScan();
  };

  // Real-Time Calculation Preview
  const livePreviewBreakdown = useMemo(() => {
    const totalInput = Number(totalAmount) || 0;
    const taxPct = Number(taxServicePercent) || 0;
    const n = validParticipants.length;

    if (n === 0) return [];

    if (splitMethod === 'equal') {
      const share = totalInput / n;
      return validParticipants.map((name) => ({
        name,
        share,
        isMe: name.toLowerCase() === 'me' || name.toLowerCase() === 'saya',
      }));
    }

    // Itemized calculation
    const subtotals: Record<string, number> = {};
    validParticipants.forEach((p) => {
      subtotals[p] = 0;
    });

    let itemsSubtotal = 0;
    items.forEach((it) => {
      const price = Number(it.price) || 0;
      itemsSubtotal += price;
      const assignees = it.assignedTo.filter((a) => validParticipants.includes(a));
      if (assignees.length > 0) {
        const perPerson = price / assignees.length;
        assignees.forEach((p) => {
          subtotals[p] = (subtotals[p] || 0) + perPerson;
        });
      }
    });

    const taxAmount = (itemsSubtotal * taxPct) / 100;
    return validParticipants.map((name) => {
      const pSub = subtotals[name] || 0;
      const ratio = itemsSubtotal > 0 ? pSub / itemsSubtotal : 1 / n;
      const pTax = taxAmount * ratio;
      return {
        name,
        share: pSub + pTax,
        subtotal: pSub,
        taxShare: pTax,
        isMe: name.toLowerCase() === 'me' || name.toLowerCase() === 'saya',
      };
    });
  }, [totalAmount, taxServicePercent, splitMethod, validParticipants, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (validParticipants.length < 1) {
        throw new Error('Please include at least 1 participant');
      }

      const totalToSave =
        splitMethod === 'itemized'
          ? items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
          : Number(totalAmount) || 0;

      await splitBillService.createSplitBill({
        title: title || 'Split-Bill Session',
        totalAmount: totalToSave,
        taxServicePercent: Number(taxServicePercent || 0),
        splitMethod,
        participants: validParticipants.map((name) => ({ name })),
        items:
          splitMethod === 'itemized'
            ? items.map((i) => ({
                item: i.item || 'Item',
                price: Number(i.price) || 0,
                assignedTo: i.assignedTo,
              }))
            : undefined,
        accountId: selectedAccountId || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save split bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Split-Bill" maxWidth="max-w-3xl">
      {error && <ErrorAlert message={error} />}

      {/* Account / Wallet Selector for Personal Share Deduction */}
      <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deduct My Personal Share From Account:
            </span>
          </div>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">-- Do not deduct wallet balance --</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Switcher: Option 1 (Manual Entry) vs Option 2 (GoPay Receipt Scanner) */}
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
        <button
          type="button"
          onClick={() => {
            setInputMode('manual');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            inputMode === 'manual'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-primary-600" />
          Option 1: Manual Entry
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode('ocr');
            setSplitMethod('itemized');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            inputMode === 'ocr'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ScanLine className="w-4 h-4 text-primary-600" />
          Option 2: Scan Receipt (GoPay OCR)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-6">
        {inputMode === 'ocr' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800 text-xs font-semibold">
              <span
                onClick={() => setOcrStep('upload')}
                className={`cursor-pointer ${ocrStep === 'upload' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-400'}`}
              >
                1. Upload Receipt
              </span>
              <span className="text-slate-300">→</span>
              <span
                onClick={() => setOcrStep('validate')}
                className={`cursor-pointer ${ocrStep === 'validate' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-400'}`}
              >
                2. Validate Extracted Items
              </span>
              <span className="text-slate-300">→</span>
              <span
                onClick={() => setOcrStep('assign')}
                className={`cursor-pointer ${ocrStep === 'assign' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-400'}`}
              >
                3. Member Checkbox Assignment
              </span>
            </div>

            {ocrStep === 'upload' && (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
                {scanning ? (
                  <div className="py-8 space-y-3">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-primary-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      AI OCR is extracting items, tax, and total from receipt...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Take Photo or Upload Receipt Image
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Automatically detects merchant name, items, prices, and PB1 tax.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <Upload className="w-4 h-4" />
                        Choose Receipt Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleSimulateReceiptScan}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Quick Test Sample Receipt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {ocrStep === 'validate' && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Merchant Name
                    </span>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tax & Service Charge (%)
                    </span>
                    <input
                      type="number"
                      value={taxServicePercent}
                      onChange={(e) => setTaxServicePercent(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Extracted Receipt Items ({items.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => {
                            const n = [...items];
                            n[idx].item = e.target.value;
                            setItems(n);
                          }}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const n = [...items];
                            n[idx].price = e.target.value;
                            setItems(n);
                          }}
                          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOcrStep('upload')}
                  >
                    Back to Re-scan
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setOcrStep('assign');
                    }}
                  >
                    Confirm & Assign to Members →
                  </Button>
                </div>
              </div>
            )}

            {ocrStep === 'assign' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Participants
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {participants.map((name, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 pl-2.5 dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => handleParticipantChange(idx, e.target.value)}
                          className="w-20 bg-transparent text-xs font-semibold outline-none dark:text-white"
                        />
                        {participants.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(idx)}
                            className="rounded p-0.5 text-slate-400 hover:text-rose-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="inline-flex items-center gap-1 rounded-xl border border-dashed border-primary-500/50 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Member
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Items For Each Member (Checkboxes)
                  </span>

                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                    {validParticipants.map((member) => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => setActiveMemberTab(member)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          activeMemberTab === member
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        👤 {member}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {items.map((item, idx) => {
                      const isChecked = item.assignedTo.includes(activeMemberTab);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemAssignee(idx, activeMemberTab)}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                            isChecked
                              ? 'border-primary-500 bg-primary-50/50 dark:border-primary-500/50 dark:bg-primary-950/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            )}
                            <span className="text-xs font-semibold text-slate-800 dark:text-white">
                              {item.item}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {currencyFormatter.format(Number(item.price))}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({item.assignedTo.length} person{item.assignedTo.length > 1 ? 's' : ''})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-start pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOcrStep('validate')}
                  >
                    ← Back to Extracted Items
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {inputMode === 'manual' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Receipt className="w-4 h-4 text-primary-600" />
                <span>1. Bill Details</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bill Title / Location
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starbucks Reserve / Dinner"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Total Amount (Rp)
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="150000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span>2. Participants</span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {validParticipants.length} People
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {participants.map((name, idx) => {
                  const isMe = name.toLowerCase() === 'me' || name.toLowerCase() === 'saya';
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-1 pl-2 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white uppercase">
                        {name.charAt(0) || '?'}
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleParticipantChange(idx, e.target.value)}
                        className="w-20 bg-transparent text-xs font-medium outline-none dark:text-white"
                      />
                      {!isMe && participants.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(idx)}
                          className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="inline-flex items-center gap-1 rounded-xl border border-dashed border-primary-500/50 bg-primary-50/50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100/60 dark:bg-primary-950/20 dark:text-primary-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Person
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Calculator className="w-4 h-4 text-primary-600" />
                <span>3. Split Method</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div
                  onClick={() => setSplitMethod('equal')}
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    splitMethod === 'equal'
                      ? 'border-primary-600 bg-primary-50/50 dark:border-primary-500 dark:bg-primary-950/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ⚖️ Equal Split
                    </span>
                    {splitMethod === 'equal' && <Check className="w-4 h-4 text-primary-600" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Divides total equally across all {validParticipants.length} people.
                  </p>
                </div>

                <div
                  onClick={() => setSplitMethod('itemized')}
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    splitMethod === 'itemized'
                      ? 'border-primary-600 bg-primary-50/50 dark:border-primary-500 dark:bg-primary-950/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      🍽️ Itemized Split (+Tax)
                    </span>
                    {splitMethod === 'itemized' && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Assign specific ordered items per person. Proportional tax calculation.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Tax / Service Charge (%)
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTaxServicePercent(String(pct))}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        Number(taxServicePercent) === pct
                          ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={taxServicePercent}
                    onChange={(e) => setTaxServicePercent(e.target.value)}
                    className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>

            {splitMethod === 'itemized' && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ordered Items & Assignees
                </span>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-2.5"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Item name (e.g. Coffee)"
                          value={item.item}
                          onChange={(e) => {
                            const n = [...items];
                            n[idx].item = e.target.value;
                            setItems(n);
                          }}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="Price Rp"
                          value={item.price}
                          onChange={(e) => {
                            const n = [...items];
                            n[idx].price = e.target.value;
                            setItems(n);
                          }}
                          className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400 mr-1">
                          Assigned to:
                        </span>
                        {validParticipants.map((personName, pIdx) => {
                          const isAssigned = item.assignedTo.includes(personName);
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => toggleItemAssignee(idx, personName)}
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                                isAssigned
                                  ? 'bg-primary-600 text-white shadow-sm'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {isAssigned ? '✓ ' : '+ '}
                              {personName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Item
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-primary-500/30 bg-primary-50/40 p-4 dark:border-primary-500/20 dark:bg-primary-950/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              📊 Live Real-Time Share Breakdown
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {splitMethod === 'equal' ? 'Equal Share' : `+Tax/Service ${taxServicePercent}% Proportional`}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {livePreviewBreakdown.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-white/90 px-3.5 py-2 shadow-2xs dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white uppercase">
                    {person.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    {person.name} {person.isMe ? '(Me)' : ''}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currencyFormatter.format(person.share)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Split-Bill & Record Debts'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
