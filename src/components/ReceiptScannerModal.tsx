import React, { useRef, useState } from "react";
import { AlertCircle, Camera, FileText, Loader2, Upload, X } from "lucide-react";
import type { ReceiptData, ReceiptItem } from "../types/receipt";
import { CharacterAvatar } from "./CharacterAvatar";

interface ParsedReceiptPayload {
  merchantName?: string;
  date?: string;
  currency?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    totalPrice?: number;
  }>;
  tax?: number;
  tip?: number;
  discount?: number;
}

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptParsed: (receipt: ReceiptData) => void;
  defaultPayerId: string;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptParsed,
  defaultPayerId,
}) => {
  const [mode, setMode] = useState<"photo" | "text">("photo");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [receiptText, setReceiptText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, or WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        setError("Could not read the selected image file.");
        return;
      }
      setPreviewUrl(result);
      setImageBase64(result);
      setMimeType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const buildReceiptFromPayload = (data: ParsedReceiptPayload): ReceiptData => {
    const nowId = Date.now();
    const items: ReceiptItem[] = (data.items ?? [])
      .filter((it) => it && (it.name || typeof it.totalPrice === "number"))
      .map((it, idx) => ({
        id: `scan-${nowId}-${idx}`,
        name: String(it.name || `Item ${idx + 1}`).trim(),
        quantity: Math.max(1, Math.round(Number(it.quantity) || 1)),
        totalPrice: Math.max(0, Number(it.totalPrice) || 0),
        assignedTo: [],
      }));

    if (items.length === 0) {
      items.push({
        id: `scan-${nowId}-0`,
        name: "Receipt Item",
        quantity: 1,
        totalPrice: 0,
        assignedTo: [],
      });
    }

    return {
      id: `receipt-${nowId}`,
      merchantName: String(data.merchantName || "Scanned Receipt").trim(),
      date:
        typeof data.date === "string" && data.date.trim()
          ? data.date.trim()
          : new Date().toISOString().slice(0, 10),
      currency: String(data.currency || "PHP").toUpperCase().slice(0, 3),
      items,
      tax: Math.max(0, Number(data.tax) || 0),
      tip: Math.max(0, Number(data.tip) || 0),
      discount: Math.max(0, Number(data.discount) || 0),
      allocationMode: "proportional",
      payerId: defaultPayerId,
    };
  };

  const handleScanImage = async () => {
    if (!imageBase64) {
      setError("Choose or drop a receipt photo first.");
      return;
    }
    setIsScanning(true);
    setError(null);

    try {
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const data = (await res.json()) as ParsedReceiptPayload & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Unable to scan receipt right now.");
      }

      const receipt = buildReceiptFromPayload(data);
      onReceiptParsed(receipt);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to extract receipt items."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleParseText = async () => {
    if (!receiptText.trim()) {
      setError("Paste receipt text or an order summary first.");
      return;
    }
    setIsScanning(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-receipt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptText }),
      });

      const data = (await res.json()) as ParsedReceiptPayload & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Unable to parse receipt text.");
      }

      const receipt = buildReceiptFromPayload(data);
      onReceiptParsed(receipt);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to parse receipt text."
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231B20]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div className="w-full max-w-xl bg-white border border-[#EFE2E7] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE2E7]">
          <div className="flex items-center gap-3">
            <CharacterAvatar characterId="kitty" size="sm" />
            <div>
              <h2
                id="scanner-modal-title"
                className="font-display text-lg font-semibold text-[#231B20]"
              >
                Import a Receipt
              </h2>
              <p className="text-xs text-[#6D5B63]">
                Upload a photo or paste order text to extract line items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="p-2 rounded-lg text-[#6D5B63] hover:text-[#231B20] hover:bg-[#FFF5F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Segmented Control */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF3F5] rounded-xl border border-[#EFE2E7]">
            <button
              type="button"
              onClick={() => {
                setMode("photo");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                mode === "photo"
                  ? "bg-white text-[#231B20] shadow-xs"
                  : "text-[#6D5B63] hover:text-[#231B20]"
              }`}
            >
              <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Receipt Photo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("text");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                mode === "text"
                  ? "bg-white text-[#231B20] shadow-xs"
                  : "text-[#6D5B63] hover:text-[#231B20]"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Paste Receipt Text</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {mode === "photo" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  isDragging
                    ? "border-[#E11D48] bg-[#FFF0F3]"
                    : "border-[#E6CED6] bg-[#FFFDFC] hover:border-[#E11D48]/60 hover:bg-[#FFF7FA]"
                }`}
              >
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Uploaded receipt preview"
                      referrerPolicy="no-referrer"
                      className="max-h-56 mx-auto rounded-lg border border-[#EFE2E7] object-contain"
                    />
                    <p className="text-xs font-medium text-[#6D5B63]">
                      Click or drop another photo to replace
                    </p>
                  </div>
                ) : (
                  <div className="py-6 space-y-2">
                    <div className="w-11 h-11 rounded-full bg-[#FFF0F3] text-[#E11D48] flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-semibold text-[#231B20]">
                      Drop a receipt photo here, or click to browse
                    </p>
                    <p className="text-xs text-[#6D5B63]">
                      Supports cafe, restaurant, and grocery receipts in PNG or JPG
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor="receipt-text-input"
                className="block text-sm font-medium text-[#231B20]"
              >
                Paste email receipt or itemized text
              </label>
              <textarea
                id="receipt-text-input"
                rows={7}
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                placeholder={
                  "Matcha Cafe\n2x Strawberry Latte ₱340.00\n1x Yuzu Cheesecake ₱245.00\n1x Karaage Plate ₱310.00\nTax ₱107.40\nTip ₱90.00"
                }
                className="w-full rounded-xl border border-[#E6CED6] bg-[#FFFDFC] p-3.5 text-sm font-mono text-[#231B20] placeholder:text-[#A49099] focus:outline-none focus:border-[#E11D48]"
              />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isScanning}
              className="px-4 py-2 text-sm font-medium text-[#6D5B63] hover:text-[#231B20] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={mode === "photo" ? handleScanImage : handleParseText}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Extracting Items...</span>
                </>
              ) : (
                <span>
                  {mode === "photo" ? "Extract Receipt Items" : "Parse Receipt Text"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
