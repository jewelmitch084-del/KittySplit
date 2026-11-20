import React, { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
} from "lucide-react";
import type { ReceiptData, SplitSummary } from "../types/receipt";
import { buildTextSummary, formatMoney } from "../utils/splitMath";
import { CharacterAvatar } from "./CharacterAvatar";

interface SettlementPanelProps {
  receipt: ReceiptData;
  summary: SplitSummary;
  onSaveSplit: () => void;
  onOpenSummaryCard: () => void;
}

export const SettlementPanel: React.FC<SettlementPanelProps> = ({
  receipt,
  summary,
  onSaveSplit,
  onOpenSummaryCard,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const assignmentPercent =
    summary.subtotal > 0
      ? Math.min(
          100,
          Math.round((summary.assignedSubtotal / summary.subtotal) * 100)
        )
      : 100;

  const handleCopy = async () => {
    const text = buildTextSummary(receipt, summary);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored gracefully
    }
  };

  const handleSave = () => {
    onSaveSplit();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <aside aria-label="Settlement breakdown" className="space-y-4">
      {/* Assignment Progress */}
      <div className="bg-white border border-[#EFE2E7] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="font-display text-base font-semibold text-[#231B20]">
            Split Breakdown
          </h2>
          <span
            className={`text-xs font-semibold tabular-nums ${
              summary.unassignedCount === 0
                ? "text-[#15803D]"
                : "text-[#B45309]"
            }`}
          >
            {summary.unassignedCount === 0
              ? "All items assigned"
              : `${summary.unassignedCount} unassigned (${formatMoney(
                  summary.unassignedSubtotal,
                  receipt.currency
                )})`}
          </span>
        </div>

        <div className="h-2 w-full bg-[#FAF3F5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E11D48] transition-all duration-200 rounded-full"
            style={{ width: `${assignmentPercent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-[#6D5B63] font-mono tabular-nums">
          <span>
            Assigned: {formatMoney(summary.assignedSubtotal, receipt.currency)}
          </span>
          <span>
            Subtotal: {formatMoney(summary.subtotal, receipt.currency)}
          </span>
        </div>
      </div>

      {/* Per-Friend Totals */}
      <div className="bg-white border border-[#EFE2E7] rounded-2xl divide-y divide-[#F4EAEE]">
        {summary.breakdowns.map((b) => {
          const isExpanded = expandedId === b.participant.id;
          return (
            <div key={b.participant.id} className="p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : b.participant.id)
                }
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CharacterAvatar
                    characterId={b.participant.characterId}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#231B20] truncate">
                        {b.participant.name}
                      </span>
                      {b.isPayer && (
                        <span className="text-[11px] font-semibold text-[#E11D48]">
                          · Paid bill
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6D5B63] tabular-nums">
                      {b.lines.length} {b.lines.length === 1 ? "item" : "items"}{" "}
                      · Tax & tip{" "}
                      {formatMoney(b.taxShare + b.tipShare, receipt.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-base font-semibold text-[#231B20] tabular-nums">
                    {formatMoney(b.totalOwed, receipt.currency)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#8E7A83]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8E7A83]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#F4EAEE] space-y-1.5 text-xs">
                  {b.lines.length === 0 ? (
                    <p className="text-[#8E7A83]">No items assigned yet.</p>
                  ) : (
                    b.lines.map((line) => (
                      <div
                        key={line.itemId}
                        className="flex items-center justify-between gap-2 text-[#4A3B42]"
                      >
                        <span className="truncate">
                          {line.itemName}{" "}
                          <span className="text-[#8E7A83]">
                            ({line.shareRatio})
                          </span>
                        </span>
                        <span className="font-mono tabular-nums shrink-0">
                          {formatMoney(line.amount, receipt.currency)}
                        </span>
                      </div>
                    ))
                  )}
                  <div className="flex items-center justify-between text-[#6D5B63] pt-1 border-t border-dashed border-[#EFE2E7]">
                    <span>Tax</span>
                    <span className="font-mono tabular-nums">
                      {formatMoney(b.taxShare, receipt.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#6D5B63]">
                    <span>Tip</span>
                    <span className="font-mono tabular-nums">
                      {formatMoney(b.tipShare, receipt.currency)}
                    </span>
                  </div>
                  {b.discountShare > 0 && (
                    <div className="flex items-center justify-between text-[#15803D]">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">
                        -{formatMoney(b.discountShare, receipt.currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Who Owes Whom Transfers */}
      <div className="bg-white border border-[#EFE2E7] rounded-2xl p-5 space-y-3">
        <h3 className="font-display text-sm font-semibold text-[#231B20]">
          Settlement Transfers
        </h3>

        {summary.transfers.length === 0 ? (
          <p className="text-xs text-[#6D5B63]">
            Assign items to friends to calculate who owes the payer.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {summary.transfers.map((t) => (
              <li
                key={`${t.from.id}-${t.to.id}`}
                className="flex items-center justify-between gap-2 text-sm py-1.5 px-3 rounded-xl bg-[#FFF9FB] border border-[#F4EAEE]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CharacterAvatar
                    characterId={t.from.characterId}
                    size="xs"
                  />
                  <span className="font-medium text-[#231B20] truncate">
                    {t.from.name}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-[#8E7A83] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[#6D5B63] truncate">{t.to.name}</span>
                </div>
                <span className="font-mono font-semibold text-[#E11D48] tabular-nums shrink-0">
                  {formatMoney(t.amount, receipt.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Action Buttons */}
        <div className="pt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#231B20] bg-[#FAF3F5] hover:bg-[#F3E6EB] border border-[#EFE2E7] rounded-xl transition-colors whitespace-nowrap"
          >
            {savedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Save Split</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenSummaryCard}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#6D5B63] hover:text-[#231B20] rounded-lg transition-colors"
        >
          <Printer className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Open Printable Summary Card</span>
        </button>
      </div>
    </aside>
  );
};
