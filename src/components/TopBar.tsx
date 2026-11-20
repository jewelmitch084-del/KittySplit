import React from "react";
import { Camera } from "lucide-react";

export type ActiveTab = "split" | "saved" | "summary";

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenScanner: () => void;
  savedCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  savedCount,
}) => {
  return (
    <header className="no-print border-b border-[#EFE2E7] bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab("split")}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E11D48] rounded-md"
        >
          <svg
            viewBox="0 0 36 24"
            className="w-7 h-5 shrink-0"
            aria-hidden="true"
          >
            <ellipse
              cx="9.5"
              cy="12"
              rx="8"
              ry="7"
              fill="#E11D48"
              stroke="#2D1F24"
              strokeWidth="2"
            />
            <ellipse
              cx="26.5"
              cy="12"
              rx="8"
              ry="7"
              fill="#E11D48"
              stroke="#2D1F24"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="12"
              r="4.2"
              fill="#FB7185"
              stroke="#2D1F24"
              strokeWidth="2"
            />
          </svg>
          <span className="font-display text-xl font-bold tracking-tight text-[#231B20]">
            KittySplit
          </span>
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav
          className="flex items-center gap-6 sm:gap-8 text-sm font-medium"
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => onSelectTab("split")}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E11D48] ${
              activeTab === "split"
                ? "text-[#231B20] border-[#E11D48]"
                : "text-[#6D5B63] border-transparent hover:text-[#231B20]"
            }`}
          >
            Split Receipt
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("saved")}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E11D48] ${
              activeTab === "saved"
                ? "text-[#231B20] border-[#E11D48]"
                : "text-[#6D5B63] border-transparent hover:text-[#231B20]"
            }`}
          >
            Saved Splits{savedCount > 0 ? ` (${savedCount})` : ""}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("summary")}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E11D48] ${
              activeTab === "summary"
                ? "text-[#231B20] border-[#E11D48]"
                : "text-[#6D5B63] border-transparent hover:text-[#231B20]"
            }`}
          >
            Summary Card
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
          >
            <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Scan Receipt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
