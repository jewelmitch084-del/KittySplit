import { useEffect, useMemo, useState } from "react";
import type {
  CharacterId,
  Participant,
  ReceiptData,
  SavedSplit,
} from "./types/receipt";
import { DEFAULT_PARTICIPANTS } from "./data/characters";
import { SAMPLE_RECEIPTS } from "./data/sampleReceipts";
import { calculateSplit } from "./utils/splitMath";
import { TopBar, type ActiveTab } from "./components/TopBar";
import { CharacterRoster } from "./components/CharacterRoster";
import { PaperReceiptEditor } from "./components/PaperReceiptEditor";
import { SettlementPanel } from "./components/SettlementPanel";
import { ReceiptScannerModal } from "./components/ReceiptScannerModal";
import { SavedSplitsView } from "./components/SavedSplitsView";
import { SummaryCardView } from "./components/SummaryCardView";

const STORAGE_KEY = "kittysplit_saved_v1";

function loadInitialSaved(): SavedSplit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("split");
  const [participants, setParticipants] =
    useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [receipt, setReceipt] = useState<ReceiptData>(
    SAMPLE_RECEIPTS[0].receipt
  );
  const [activePainterId, setActivePainterId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [savedSplits, setSavedSplits] = useState<SavedSplit[]>(loadInitialSaved);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSplits));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedSplits]);

  const summary = useMemo(
    () => calculateSplit(receipt, participants),
    [receipt, participants]
  );

  const handleAddParticipant = (name: string, characterId: CharacterId) => {
    const newFriend: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name,
      characterId,
    };
    setParticipants((prev) => [...prev, newFriend]);
  };

  const handleRenameParticipant = (id: string, name: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleChangeCharacter = (id: string, characterId: CharacterId) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, characterId } : p))
    );
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (receipt.payerId === id && remaining.length > 0) {
        setReceipt((r) => ({ ...r, payerId: remaining[0].id }));
      }
      return remaining;
    });
    setReceipt((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((pid) => pid !== id),
      })),
    }));
    if (activePainterId === id) {
      setActivePainterId(null);
    }
  };

  const handleLoadPreset = (presetReceipt: ReceiptData) => {
    // Ensure default participants exist if user removed any so preset items map cleanly
    const currentIds = new Set(participants.map((p) => p.id));
    const missingDefaults = DEFAULT_PARTICIPANTS.filter(
      (dp) => !currentIds.has(dp.id)
    );
    if (missingDefaults.length > 0) {
      setParticipants((prev) => [...prev, ...missingDefaults]);
    }
    setReceipt({
      ...presetReceipt,
      items: presetReceipt.items.map((it) => ({
        ...it,
        assignedTo: [...it.assignedTo],
      })),
    });
    setActivePainterId(null);
  };

  const handleCreateBlank = () => {
    setReceipt({
      id: `blank-${Date.now()}`,
      merchantName: "New Receipt",
      date: new Date().toISOString().slice(0, 10),
      currency: "PHP",
      items: [
        {
          id: `item-${Date.now()}`,
          name: "First Item",
          quantity: 1,
          totalPrice: 150.0,
          assignedTo: [],
        },
      ],
      tax: 0,
      tip: 0,
      discount: 0,
      allocationMode: "proportional",
      payerId: participants[0]?.id ?? "p-kitty",
    });
    setActivePainterId(null);
  };

  const handleSaveSplit = () => {
    const entry: SavedSplit = {
      id: `${receipt.id}-${Date.now()}`,
      savedAt: new Date().toISOString(),
      receipt: {
        ...receipt,
        items: receipt.items.map((i) => ({
          ...i,
          assignedTo: [...i.assignedTo],
        })),
      },
      participants: participants.map((p) => ({ ...p })),
      grandTotal: summary.grandTotal,
    };
    setSavedSplits((prev) => [entry, ...prev].slice(0, 20));
  };

  const handleLoadSavedSplit = (saved: SavedSplit) => {
    setParticipants(saved.participants);
    setReceipt(saved.receipt);
    setActivePainterId(null);
    setActiveTab("split");
  };

  const handleDeleteSavedSplit = (id: string) => {
    setSavedSplits((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#231B20] flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        savedCount={savedSplits.length}
      />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-7 sm:py-9">
        {activeTab === "split" && (
          <div className="space-y-6">
            {/* Concise Editorial Intro */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#231B20] [text-wrap:balance]">
                  Split every receipt down to the last strawberry crepe
                </h1>
                <p className="text-sm text-[#6D5B63] mt-1.5">
                  Scan a receipt photo or edit items directly, tap a Hello Kitty
                  & Friends character to claim items, and settle tax and tip
                  fairly.
                </p>
              </div>
            </div>

            {/* Friends Roster */}
            <CharacterRoster
              participants={participants}
              activePainterId={activePainterId}
              payerId={receipt.payerId}
              onSelectPainter={setActivePainterId}
              onSetPayer={(id) =>
                setReceipt((prev) => ({ ...prev, payerId: id }))
              }
              onAddParticipant={handleAddParticipant}
              onRenameParticipant={handleRenameParticipant}
              onChangeCharacter={handleChangeCharacter}
              onRemoveParticipant={handleRemoveParticipant}
            />

            {/* Two-Column Split Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.95fr] gap-7 items-start">
              <PaperReceiptEditor
                receipt={receipt}
                participants={participants}
                activePainterId={activePainterId}
                subtotal={summary.subtotal}
                grandTotal={summary.grandTotal}
                onUpdateReceipt={setReceipt}
                onLoadPreset={handleLoadPreset}
                onCreateBlank={handleCreateBlank}
                onOpenScanner={() => setIsScannerOpen(true)}
              />

              <div className="lg:sticky lg:top-22">
                <SettlementPanel
                  receipt={receipt}
                  summary={summary}
                  onSaveSplit={handleSaveSplit}
                  onOpenSummaryCard={() => setActiveTab("summary")}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <SavedSplitsView
            savedSplits={savedSplits}
            onLoadSplit={handleLoadSavedSplit}
            onDeleteSplit={handleDeleteSavedSplit}
            onGoToEditor={() => setActiveTab("split")}
          />
        )}

        {activeTab === "summary" && (
          <SummaryCardView
            receipt={receipt}
            summary={summary}
            onBackToEditor={() => setActiveTab("split")}
          />
        )}
      </main>

      <footer className="no-print border-t border-[#EFE2E7] bg-white py-5 mt-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6D5B63]">
          <span>KittySplit · Receipt-to-Split Expense Splitter</span>
          <span>Proportional & equal tax/tip math · Local browser saves</span>
        </div>
      </footer>

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReceiptParsed={(parsedReceipt) => {
          setReceipt(parsedReceipt);
          setActivePainterId(null);
          setActiveTab("split");
        }}
        defaultPayerId={receipt.payerId || participants[0]?.id || "p-kitty"}
      />
    </div>
  );
}
