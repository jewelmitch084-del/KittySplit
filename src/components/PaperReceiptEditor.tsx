import React, { useState } from "react";
import { Plus, Receipt, Trash2, Users } from "lucide-react";
import type {
  Participant,
  ReceiptData,
  ReceiptItem,
  TaxTipAllocationMode,
} from "../types/receipt";
import { SAMPLE_RECEIPTS } from "../data/sampleReceipts";
import { formatMoney, getCurrencySymbol } from "../utils/splitMath";
import { CharacterAvatar } from "./CharacterAvatar";

interface PaperReceiptEditorProps {
  receipt: ReceiptData;
  participants: Participant[];
  activePainterId: string | null;
  subtotal: number;
  grandTotal: number;
  onUpdateReceipt: (updater: (prev: ReceiptData) => ReceiptData) => void;
  onLoadPreset: (presetReceipt: ReceiptData) => void;
  onCreateBlank: () => void;
  onOpenScanner: () => void;
}

const CURRENCIES = ["PHP", "MXN", "USD", "JPY", "EUR", "GBP", "CAD", "AUD"];

export const PaperReceiptEditor: React.FC<PaperReceiptEditorProps> = ({
  receipt,
  participants,
  activePainterId,
  subtotal,
  grandTotal,
  onUpdateReceipt,
  onLoadPreset,
  onCreateBlank,
  onOpenScanner,
}) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");

  const symbol = getCurrencySymbol(receipt.currency);

  const toggleItemParticipant = (itemId: string, participantId: string) => {
    onUpdateReceipt((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.assignedTo.includes(participantId);
        return {
          ...item,
          assignedTo: exists
            ? item.assignedTo.filter((id) => id !== participantId)
            : [...item.assignedTo, participantId],
        };
      }),
    }));
  };

  const toggleAssignAll = (itemId: string) => {
    const allIds = participants.map((p) => p.id);
    onUpdateReceipt((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const allSelected = allIds.every((id) => item.assignedTo.includes(id));
        return {
          ...item,
          assignedTo: allSelected ? [] : allIds,
        };
      }),
    }));
  };

  const updateItemField = (
    itemId: string,
    patch: Partial<Pick<ReceiptItem, "name" | "quantity" | "totalPrice">>
  ) => {
    onUpdateReceipt((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      ),
    }));
  };

  const deleteItem = (itemId: string) => {
    onUpdateReceipt((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newItemName.trim();
    const parsedPrice = parseFloat(newItemPrice);
    const parsedQty = Math.max(1, parseInt(newItemQty, 10) || 1);
    if (!cleanName || Number.isNaN(parsedPrice)) return;

    const newItem: ReceiptItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      quantity: parsedQty,
      totalPrice: Math.max(0, parsedPrice),
      assignedTo: activePainterId ? [activePainterId] : [],
    };

    onUpdateReceipt((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setNewItemName("");
    setNewItemQty("1");
    setNewItemPrice("");
  };

  const applyTipPercent = (pct: number) => {
    const computed = Math.round(subtotal * (pct / 100) * 100) / 100;
    onUpdateReceipt((prev) => ({ ...prev, tip: computed }));
  };

  const activePainter = participants.find((p) => p.id === activePainterId);

  return (
    <section aria-label="Paper receipt ledger" className="space-y-4">
      {/* Quick Receipt Presets & Scan Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-[#6D5B63] mr-1">
            Sample Receipts:
          </span>
          {SAMPLE_RECEIPTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset.receipt)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                receipt.id === preset.receipt.id
                  ? "bg-[#231B20] text-white border-[#231B20]"
                  : "bg-white text-[#6D5B63] border-[#EFE2E7] hover:text-[#231B20] hover:border-[#DFC6D0]"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onCreateBlank}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border bg-white text-[#6D5B63] border-[#EFE2E7] hover:text-[#231B20] hover:border-[#DFC6D0] transition-colors whitespace-nowrap"
          >
            Blank Receipt
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenScanner}
          className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] underline underline-offset-4 whitespace-nowrap"
        >
          Upload Photo or Paste Text
        </button>
      </div>

      {/* Paper Receipt Sheet */}
      <div className="relative drop-shadow-[0_6px_22px_rgba(35,27,32,0.06)]">
        <div className="h-2.5 w-full receipt-edge-top" aria-hidden="true" />
        <div className="bg-white border-x border-[#EFE2E7] px-5 sm:px-7 py-6">
          {/* Receipt Header */}
          <div className="border-b border-dashed border-[#DFC6D0] pb-5 mb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E11D48] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <label htmlFor="merchant-name" className="sr-only">
                    Merchant Name
                  </label>
                  <input
                    id="merchant-name"
                    type="text"
                    value={receipt.merchantName}
                    onChange={(e) =>
                      onUpdateReceipt((prev) => ({
                        ...prev,
                        merchantName: e.target.value,
                      }))
                    }
                    placeholder="Cafe or Store Name"
                    className="w-full font-display text-xl font-bold text-[#231B20] bg-transparent border-b border-transparent hover:border-[#EFE2E7] focus:border-[#E11D48] focus:outline-none py-0.5"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D5B63] mt-1">
                    <input
                      type="date"
                      aria-label="Receipt date"
                      value={receipt.date}
                      onChange={(e) =>
                        onUpdateReceipt((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="bg-transparent text-xs text-[#6D5B63] focus:outline-none focus:text-[#231B20]"
                    />
                    <span aria-hidden="true">·</span>
                    <span>{receipt.items.length} items</span>
                    <span aria-hidden="true">·</span>
                    <select
                      aria-label="Currency"
                      value={receipt.currency}
                      onChange={(e) =>
                        onUpdateReceipt((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      className="bg-transparent text-xs font-medium text-[#231B20] focus:outline-none cursor-pointer"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {activePainter && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFF0F3] text-[#881337] text-xs font-semibold">
                  <CharacterAvatar
                    characterId={activePainter.characterId}
                    size="xs"
                  />
                  <span>Tap items for {activePainter.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column Labels */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-3 px-2 pb-2 text-[11px] font-semibold text-[#6D5B63] border-b border-[#F4EAEE]">
            <span>Item & Assigned Friends</span>
            <span className="w-24 text-right">Price</span>
            <span className="w-16 text-right">Actions</span>
          </div>

          {/* Line Items */}
          {receipt.items.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6D5B63]">
              No items on this receipt yet. Add an item below or scan a receipt photo.
            </div>
          ) : (
            <ul className="divide-y divide-[#F4EAEE]">
              {receipt.items.map((item) => {
                const isUnassigned = item.assignedTo.length === 0;
                const allAssigned =
                  participants.length > 0 &&
                  participants.every((p) => item.assignedTo.includes(p.id));
                const isPaintedByActive =
                  activePainterId !== null &&
                  item.assignedTo.includes(activePainterId);

                return (
                  <li
                    key={item.id}
                    onClick={() => {
                      if (activePainterId) {
                        toggleItemParticipant(item.id, activePainterId);
                      }
                    }}
                    className={`py-3 px-2 transition-colors rounded-lg ${
                      activePainterId ? "cursor-pointer hover:bg-[#FFF9FB]" : ""
                    } ${isPaintedByActive ? "bg-[#FFF5F7]/70" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Item Name + Quantity */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="number"
                          min={1}
                          aria-label={`Quantity for ${item.name}`}
                          value={item.quantity}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateItemField(item.id, {
                              quantity: Math.max(
                                1,
                                parseInt(e.target.value, 10) || 1
                              ),
                            })
                          }
                          className="w-10 text-center font-mono text-xs py-1 rounded border border-[#EFE2E7] bg-[#FFFDFC] text-[#6D5B63] tabular-nums focus:outline-none focus:border-[#E11D48]"
                        />
                        <input
                          type="text"
                          aria-label="Item name"
                          value={item.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateItemField(item.id, { name: e.target.value })
                          }
                          className="flex-1 min-w-0 text-sm font-medium text-[#231B20] bg-transparent border-b border-transparent hover:border-[#EFE2E7] focus:border-[#E11D48] focus:outline-none py-0.5"
                        />
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="flex items-center font-mono text-sm font-semibold text-[#231B20] tabular-nums">
                          <span className="text-[#8E7A83] mr-0.5">{symbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            aria-label={`Price for ${item.name}`}
                            value={item.totalPrice}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              updateItemField(item.id, {
                                totalPrice: Math.max(
                                  0,
                                  parseFloat(e.target.value) || 0
                                ),
                              })
                            }
                            className="w-20 text-right bg-transparent border-b border-transparent hover:border-[#EFE2E7] focus:border-[#E11D48] focus:outline-none tabular-nums"
                          />
                        </div>

                        <div className="flex items-center gap-1 w-16 justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAssignAll(item.id);
                            }}
                            title={
                              allAssigned
                                ? "Clear everyone from item"
                                : "Split equally among everyone"
                            }
                            className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                              allAssigned
                                ? "bg-[#231B20] text-white"
                                : "bg-[#FAF3F5] text-[#6D5B63] hover:text-[#231B20]"
                            }`}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                            aria-label={`Delete ${item.name}`}
                            className="p-1 text-[#A49099] hover:text-[#DC2626] rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Character Assignment Toggles */}
                    <div
                      className="mt-2 pl-12 flex flex-wrap items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {participants.map((p) => {
                        const selected = item.assignedTo.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleItemParticipant(item.id, p.id)}
                            aria-pressed={selected}
                            className={`inline-flex items-center gap-1.5 pr-2.5 pl-1 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                              selected
                                ? "bg-[#FFF0F3] border-[#E11D48]/50 text-[#231B20]"
                                : "bg-white border-[#EFE2E7] text-[#8E7A83] opacity-75 hover:opacity-100 hover:border-[#DFC6D0]"
                            }`}
                          >
                            <CharacterAvatar
                              characterId={p.characterId}
                              size="xs"
                              active={selected}
                            />
                            <span className="max-w-[84px] truncate">{p.name}</span>
                          </button>
                        );
                      })}

                      {isUnassigned ? (
                        <span className="text-[11px] font-medium text-[#B45309] ml-1">
                          Unassigned
                        </span>
                      ) : item.assignedTo.length > 1 ? (
                        <span className="text-[11px] text-[#6D5B63] font-mono tabular-nums ml-1">
                          {formatMoney(
                            item.totalPrice / item.assignedTo.length,
                            receipt.currency
                          )}{" "}
                          each
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Add New Line Item */}
          <form
            onSubmit={handleAddItem}
            className="mt-4 pt-4 border-t border-dashed border-[#DFC6D0] flex flex-wrap items-center gap-2"
          >
            <input
              type="number"
              min={1}
              aria-label="New item quantity"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="w-12 text-center font-mono text-xs py-2 rounded-lg border border-[#E6CED6] bg-[#FFFDFC] text-[#231B20] tabular-nums focus:outline-none focus:border-[#E11D48]"
            />
            <input
              type="text"
              placeholder="Add item name (e.g. Strawberry Daifuku)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-[#E6CED6] bg-[#FFFDFC] text-[#231B20] placeholder:text-[#A49099] focus:outline-none focus:border-[#E11D48]"
            />
            <div className="flex items-center border border-[#E6CED6] bg-[#FFFDFC] rounded-lg px-2.5 py-2">
              <span className="font-mono text-xs text-[#8E7A83] mr-1">
                {symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                aria-label="New item price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-20 font-mono text-sm text-right bg-transparent text-[#231B20] tabular-nums focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#231B20] hover:bg-[#3A2D35] rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Item</span>
            </button>
          </form>

          {/* Subtotal, Tax, Tip, Discount & Grand Total */}
          <div className="mt-6 pt-5 border-t border-dashed border-[#DFC6D0] space-y-3">
            <div className="flex items-center justify-between text-sm text-[#6D5B63]">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-[#231B20] tabular-nums">
                {formatMoney(subtotal, receipt.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-[#6D5B63]">
              <label htmlFor="receipt-tax">Tax</label>
              <div className="flex items-center font-mono text-sm text-[#231B20] border border-[#EFE2E7] rounded-lg px-2.5 py-1 bg-[#FFFDFC]">
                <span className="text-[#8E7A83] mr-1">{symbol}</span>
                <input
                  id="receipt-tax"
                  type="number"
                  step="0.01"
                  min={0}
                  value={receipt.tax}
                  onChange={(e) =>
                    onUpdateReceipt((prev) => ({
                      ...prev,
                      tax: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-20 text-right bg-transparent tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#6D5B63]">
              <div className="flex items-center gap-2">
                <label htmlFor="receipt-tip">Tip</label>
                <div className="flex items-center gap-1">
                  {[0, 15, 18, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyTipPercent(pct)}
                      className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-[#FAF3F5] hover:bg-[#FFF0F3] text-[#6D5B63] hover:text-[#E11D48] transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center font-mono text-sm text-[#231B20] border border-[#EFE2E7] rounded-lg px-2.5 py-1 bg-[#FFFDFC]">
                <span className="text-[#8E7A83] mr-1">{symbol}</span>
                <input
                  id="receipt-tip"
                  type="number"
                  step="0.01"
                  min={0}
                  value={receipt.tip}
                  onChange={(e) =>
                    onUpdateReceipt((prev) => ({
                      ...prev,
                      tip: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-20 text-right bg-transparent tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-[#6D5B63]">
              <label htmlFor="receipt-discount">Discount</label>
              <div className="flex items-center font-mono text-sm text-[#231B20] border border-[#EFE2E7] rounded-lg px-2.5 py-1 bg-[#FFFDFC]">
                <span className="text-[#8E7A83] mr-1">-{symbol}</span>
                <input
                  id="receipt-discount"
                  type="number"
                  step="0.01"
                  min={0}
                  value={receipt.discount}
                  onChange={(e) =>
                    onUpdateReceipt((prev) => ({
                      ...prev,
                      discount: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-20 text-right bg-transparent tabular-nums focus:outline-none"
                />
              </div>
            </div>

            {/* Tax & Tip Allocation Mode */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#6D5B63]">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tax & tip split</span>
              </span>
              <div className="inline-flex p-0.5 bg-[#FAF3F5] rounded-lg border border-[#EFE2E7]">
                {(
                  [
                    { id: "proportional", label: "Proportional" },
                    { id: "equal", label: "Equal Split" },
                  ] as Array<{ id: TaxTipAllocationMode; label: string }>
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateReceipt((prev) => ({
                        ...prev,
                        allocationMode: opt.id,
                      }))
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      receipt.allocationMode === opt.id
                        ? "bg-white text-[#231B20] shadow-xs"
                        : "text-[#6D5B63] hover:text-[#231B20]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-[#EFE2E7] flex items-center justify-between">
              <span className="font-display text-lg font-bold text-[#231B20]">
                Receipt Total
              </span>
              <span className="font-mono text-2xl font-semibold text-[#E11D48] tabular-nums">
                {formatMoney(grandTotal, receipt.currency)}
              </span>
            </div>
          </div>
        </div>
        <div className="h-2.5 w-full receipt-edge-bottom" aria-hidden="true" />
      </div>
    </section>
  );
};
