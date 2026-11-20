import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Printer } from "lucide-react";
import type { ReceiptData, SplitSummary } from "../types/receipt";
import { buildTextSummary, formatMoney } from "../utils/splitMath";
import { CharacterAvatar } from "./CharacterAvatar";

interface SummaryCardViewProps {
  receipt: ReceiptData;
  summary: SplitSummary;
  onBackToEditor: () => void;
}

export const SummaryCardView: React.FC<SummaryCardViewProps> = ({
  receipt,
  summary,
  onBackToEditor,
}) => {
  const [copied, setCopied] = useState(false);
  const payer = summary.breakdowns.find((b) => b.isPayer)?.participant;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildTextSummary(receipt, summary));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <section aria-label="Shareable settlement summary" className="max-w-3xl mx-auto space-y-6">
      {/* Top Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToEditor}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D5B63] hover:text-[#231B20] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Receipt Editor</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied Text</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Message</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#231B20] bg-white border border-[#EFE2E7] hover:border-[#DFC6D0] rounded-xl transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print Card</span>
          </button>
        </div>
      </div>

      {/* Printable Character Receipt Card */}
      <div className="bg-white border border-[#EFE2E7] rounded-2xl overflow-hidden">
        <div className="px-6 sm:px-8 py-6 bg-[#FFF7FA] border-b border-[#EFE2E7] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CharacterAvatar
              characterId={payer?.characterId ?? "kitty"}
              size="lg"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-[#231B20]">
                {receipt.merchantName || "Receipt Settlement"}
              </h1>
              <p className="text-sm text-[#6D5B63] mt-0.5">
                {receipt.date} · {receipt.items.length} items
                {payer ? ` · Paid by ${payer.name}` : ""}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-[#6D5B63]">Grand Total</div>
            <div className="font-mono text-2xl font-bold text-[#E11D48] tabular-nums">
              {formatMoney(summary.grandTotal, receipt.currency)}
            </div>
          </div>
        </div>

        {/* Character Shares Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.breakdowns.map((b) => (
            <div
              key={b.participant.id}
              className="border border-[#EFE2E7] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F4EAEE]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CharacterAvatar
                    characterId={b.participant.characterId}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#231B20] truncate">
                      {b.participant.name}
                    </div>
                    <div className="text-xs text-[#6D5B63]">
                      {b.isPayer ? "Paid upfront" : `Owes ${payer?.name ?? "payer"}`}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-lg font-bold text-[#231B20] tabular-nums shrink-0">
                  {formatMoney(b.totalOwed, receipt.currency)}
                </span>
              </div>

              <ul className="space-y-1 text-xs text-[#4A3B42]">
                {b.lines.map((line) => (
                  <li
                    key={line.itemId}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      {line.itemName}{" "}
                      <span className="text-[#8E7A83]">({line.shareRatio})</span>
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      {formatMoney(line.amount, receipt.currency)}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between text-[#6D5B63] pt-1 border-t border-dashed border-[#EFE2E7]">
                  <span>Tax & Tip Share</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(b.taxShare + b.tipShare, receipt.currency)}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Final Transfers Bar */}
        {summary.transfers.length > 0 && (
          <div className="px-6 sm:px-8 py-5 bg-[#FFFDFC] border-t border-[#EFE2E7]">
            <h2 className="font-display text-sm font-semibold text-[#231B20] mb-3">
              Final Transfers
            </h2>
            <div className="flex flex-wrap gap-3">
              {summary.transfers.map((t) => (
                <div
                  key={`${t.from.id}-${t.to.id}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFF9FB] border border-[#EFE2E7] text-sm"
                >
                  <CharacterAvatar
                    characterId={t.from.characterId}
                    size="xs"
                  />
                  <span className="font-semibold text-[#231B20]">
                    {t.from.name}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-[#8E7A83]"
                    aria-hidden="true"
                  />
                  <span className="text-[#6D5B63]">{t.to.name}</span>
                  <span className="font-mono font-bold text-[#E11D48] tabular-nums ml-1">
                    {formatMoney(t.amount, receipt.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
