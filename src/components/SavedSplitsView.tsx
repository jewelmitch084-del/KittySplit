import React from "react";
import { ArrowUpRight, Bookmark, Trash2 } from "lucide-react";
import type { SavedSplit } from "../types/receipt";
import { formatMoney } from "../utils/splitMath";
import { CharacterAvatar } from "./CharacterAvatar";

interface SavedSplitsViewProps {
  savedSplits: SavedSplit[];
  onLoadSplit: (split: SavedSplit) => void;
  onDeleteSplit: (id: string) => void;
  onGoToEditor: () => void;
}

export const SavedSplitsView: React.FC<SavedSplitsViewProps> = ({
  savedSplits,
  onLoadSplit,
  onDeleteSplit,
  onGoToEditor,
}) => {
  return (
    <section aria-label="Saved receipt splits" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#231B20] [text-wrap:balance]">
            Saved Receipt Splits
          </h1>
          <p className="text-sm text-[#6D5B63] mt-1">
            Reopen past bills, adjust item assignments, or review totals anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToEditor}
          className="px-4 py-2 text-sm font-semibold text-[#231B20] bg-white border border-[#EFE2E7] hover:border-[#DFC6D0] rounded-xl transition-colors whitespace-nowrap"
        >
          Back to Current Receipt
        </button>
      </div>

      {savedSplits.length === 0 ? (
        <div className="bg-white border border-[#EFE2E7] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] text-[#E11D48] flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="font-display text-lg font-semibold text-[#231B20]">
              No saved splits yet
            </h2>
            <p className="text-sm text-[#6D5B63]">
              Once you finish assigning items on a receipt, click Save Split in
              the breakdown panel to keep a record here.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToEditor}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors"
          >
            Go to Receipt Splitter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedSplits.map((saved) => (
            <article
              key={saved.id}
              className="bg-white border border-[#EFE2E7] rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-[#231B20] truncate">
                      {saved.receipt.merchantName || "Untitled Receipt"}
                    </h2>
                    <p className="text-xs text-[#6D5B63] mt-0.5">
                      {saved.receipt.date} · {saved.receipt.items.length} items
                    </p>
                  </div>
                  <span className="font-mono text-base font-semibold text-[#E11D48] tabular-nums shrink-0">
                    {formatMoney(saved.grandTotal, saved.receipt.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {saved.participants.map((p) => (
                    <div key={p.id} title={p.name}>
                      <CharacterAvatar characterId={p.characterId} size="sm" />
                    </div>
                  ))}
                  <span className="text-xs text-[#6D5B63] ml-1.5 truncate">
                    {saved.participants.map((p) => p.name).join(", ")}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F4EAEE] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onLoadSplit(saved)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#231B20] hover:bg-[#3A2D35] rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Open Split</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSplit(saved.id)}
                  aria-label={`Delete saved split for ${saved.receipt.merchantName}`}
                  className="p-2 text-[#8E7A83] hover:text-[#DC2626] rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
